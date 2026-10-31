#!/usr/bin/env python3
"""
Normalizador automático de color y saturación para sprites de Visual Novel.
Toma un sprite maestro (por defecto: base.webp) y estandariza pelo,
piel, ropa, saturación y contraste en toda la carpeta assets/vn/.
"""

import argparse
import shutil
from pathlib import Path
import numpy as np
from PIL import Image


def rgb_to_lab(rgb: np.ndarray) -> np.ndarray:
    """Convierte un array RGB [0..255] a CIE LAB (L en [0..100], a y b en [-128..127])."""
    arr = rgb.astype(np.float32) / 255.0
    mask = arr > 0.04045
    arr = np.where(mask, ((arr + 0.055) / 1.055) ** 2.4, arr / 12.92)

    # Matriz sRGB -> XYZ (D65)
    m = np.array([
        [0.4124564, 0.3575761, 0.1804375],
        [0.2126729, 0.7151522, 0.0721750],
        [0.0193339, 0.1191920, 0.9503041],
    ], dtype=np.float32)
    xyz = arr @ m.T
    xyz /= np.array([0.95047, 1.00000, 1.08883], dtype=np.float32)

    eps = 0.008856
    kappa = 903.3
    f = np.where(xyz > eps, np.cbrt(xyz), (kappa * xyz + 16.0) / 116.0)

    L = 116.0 * f[..., 1] - 16.0
    a = 500.0 * (f[..., 0] - f[..., 1])
    b = 200.0 * (f[..., 1] - f[..., 2])
    return np.stack([L, a, b], axis=-1)


def lab_to_rgb(lab: np.ndarray) -> np.ndarray:
    """Convierte CIE LAB de regreso a sRGB uint8 [0..255]."""
    L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
    fy = (L + 16.0) / 116.0
    fx = a / 500.0 + fy
    fz = fy - b / 200.0

    eps = 0.008856
    kappa = 903.3
    f = np.stack([fx, fy, fz], axis=-1)
    xyz = np.where(f ** 3 > eps, f ** 3, (116.0 * f - 16.0) / kappa)
    xyz *= np.array([0.95047, 1.00000, 1.08883], dtype=np.float32)

    m_inv = np.array([
        [ 3.2404542, -1.5371385, -0.4985314],
        [-0.9692660,  1.8760108,  0.0415560],
        [ 0.0556434, -0.2040259,  1.0572252],
    ], dtype=np.float32)
    rgb = xyz @ m_inv.T
    rgb = np.clip(rgb, 0.0, 1.0)

    mask = rgb > 0.0031308
    rgb = np.where(mask, 1.055 * (rgb ** (1.0 / 2.4)) - 0.055, 12.92 * rgb)
    return np.clip(np.round(rgb * 255.0), 0, 255).astype(np.uint8)


def get_zone_weights(lab: np.ndarray, alpha: np.ndarray) -> dict:
    """
    Calcula máscaras suaves y continuas (sin bordes duros) para:
    - 'hair': tonos marrones/cálidos de luminosidad baja-media (pelo y líneas).
    - 'sweater': tonos violetas/púrpuras (b < -4, a > 2).
    - 'chromatic': todo píxel con color (excluye el blanco puro del guardapolvo).
    """
    L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
    chroma = np.sqrt(a ** 2 + b ** 2)
    opaque = (alpha > 128).astype(np.float32)

    # Peso suave para el pelo castaño (cálido: a > 0, b > 0, L entre 15 y 68)
    w_hair = (
        opaque
        * np.exp(-((L - 38.0) / 24.0) ** 2)
        * (1.0 / (1.0 + np.exp(-(b - 4.0) / 3.0)))
        * (1.0 / (1.0 + np.exp(-(a - 2.0) / 3.0)))
    )

    # Peso suave para la remera violeta (a positivo, b negativo)
    w_sweater = (
        opaque
        * (1.0 / (1.0 + np.exp(-(a - 4.0) / 3.0)))
        * (1.0 / (1.0 + np.exp((b + 5.0) / 3.0)))
    )

    # Peso para píxeles con color (ignora guardapolvo/libreta blanca donde chroma < 6)
    w_chroma = opaque * (1.0 / (1.0 + np.exp(-(chroma - 8.0) / 3.0)))

    return {"hair": w_hair, "sweater": w_sweater, "chroma": w_chroma, "opaque": opaque}


def weighted_stats(arr: np.ndarray, w: np.ndarray):
    """Devuelve media y desvío estándar ponderados para cada canal LAB."""
    w_sum = np.sum(w) + 1e-6
    mean = np.sum(arr * w[..., None], axis=(0, 1)) / w_sum
    var = np.sum(((arr - mean) ** 2) * w[..., None], axis=(0, 1)) / w_sum
    std = np.sqrt(var + 1e-6)
    return mean, std


def match_sprite_to_reference(
    src_rgba: np.ndarray, ref_stats: dict, strength: float = 0.85
) -> np.ndarray:
    rgb = src_rgba[..., :3]
    alpha = src_rgba[..., 3]
    lab = rgb_to_lab(rgb)
    w = get_zone_weights(lab, alpha)

    out_lab = lab.copy()

    # 1. Normalizar pelo (iguala tono marrón, calidez y brillo del pelo)
    for zone, zone_strength in [("hair", strength), ("sweater", strength * 0.9)]:
        if np.sum(w[zone]) > 500:
            s_mean, s_std = weighted_stats(out_lab, w[zone])
            r_mean, r_std = ref_stats[zone]
            # Limitar el factor de escala para no distorsionar sombras
            scale = np.clip(r_std / s_std, 0.78, 1.25)
            transferred = (out_lab - s_mean) * scale + r_mean
            blend = (w[zone] * zone_strength)[..., None]
            out_lab = out_lab * (1.0 - blend) + transferred * blend

    # 2. Igualar saturación global sobre zonas con color (sin teñir el guardapolvo blanco)
    chroma_src = np.sqrt(out_lab[..., 1] ** 2 + out_lab[..., 2] ** 2)
    w_c = w["chroma"]
    if np.sum(w_c) > 500:
        mean_chroma_src = np.sum(chroma_src * w_c) / (np.sum(w_c) + 1e-6)
        sat_ratio = np.clip(ref_stats["mean_chroma"] / (mean_chroma_src + 1e-6), 0.82, 1.20)
        eff_ratio = 1.0 + (sat_ratio - 1.0) * (w_c * strength)
        out_lab[..., 1] *= eff_ratio
        out_lab[..., 2] *= eff_ratio

    out_rgb = lab_to_rgb(out_lab)
    # Conservar intactos los píxeles 100% transparentes
    out_rgba = np.dstack([out_rgb, alpha])
    out_rgba[alpha == 0] = 0
    return out_rgba


def main():
    parser = argparse.ArgumentParser(description="Normaliza colores de sprites respecto a una referencia.")
    parser.add_argument("--dir", default="assets/vn", help="Carpeta con los sprites .webp")
    parser.add_argument("--ref", default="base.webp", help="Nombre del sprite de referencia")
    parser.add_argument("--strength", type=float, default=0.85, help="Intensidad del ajuste (0.0 a 1.0)")
    args = parser.parse_args()

    vn_dir = Path(args.dir)
    ref_path = vn_dir / args.ref
    if not ref_path.exists():
        raise FileNotFoundError(f"No se encontró la imagen de referencia: {ref_path}")

    # Crear backup de seguridad la primera vez
    backup_dir = vn_dir / "_backup_orig"
    backup_dir.mkdir(exist_ok=True)

    # Extraer estadísticas de la imagen maestra (base.webp)
    ref_rgba = np.array(Image.open(ref_path).convert("RGBA"))
    ref_lab = rgb_to_lab(ref_rgba[..., :3])
    ref_w = get_zone_weights(ref_lab, ref_rgba[..., 3])

    ref_chroma = np.sqrt(ref_lab[..., 1] ** 2 + ref_lab[..., 2] ** 2)
    ref_stats = {
        "hair": weighted_stats(ref_lab, ref_w["hair"]),
        "sweater": weighted_stats(ref_lab, ref_w["sweater"]),
        "mean_chroma": np.sum(ref_chroma * ref_w["chroma"]) / (np.sum(ref_w["chroma"]) + 1e-6),
    }

    for img_path in sorted(vn_dir.glob("*.webp")):
        if img_path.name == args.ref:
            print(f"[REF] {img_path.name} (imagen maestra, sin cambios)")
            continue

        backup_file = backup_dir / img_path.name
        if not backup_file.exists():
            shutil.copy2(img_path, backup_file)

        # Siempre leer desde el backup original para evitar acumular pasadas
        src_rgba = np.array(Image.open(backup_file).convert("RGBA"))
        result_rgba = match_sprite_to_reference(src_rgba, ref_stats, strength=args.strength)

        Image.fromarray(result_rgba, mode="RGBA").save(img_path, "WEBP", quality=92, method=6)
        print(f"[OK]  {img_path.name} normalizado hacia {args.ref}")


if __name__ == "__main__":
    main()