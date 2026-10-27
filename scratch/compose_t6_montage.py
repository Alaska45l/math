import os
from PIL import Image, ImageDraw, ImageFont

evidence_dir = '/home/alaska45l/.gemini/antigravity/brain/3d28227a-c5bc-4f2c-9cf3-c3d50c502683/evidence'

scan_before_path = os.path.join(evidence_dir, 'scanner_1920x1080_no_tiling.png')
scan_after_path = os.path.join(evidence_dir, 'scanner_1920x1080_after.png')
rad_before_path = os.path.join(evidence_dir, 'radiografia_lente1_1920px.png')
rad_after_path = os.path.join(evidence_dir, 'radiografia_lente1_1920px_after.png')

im_scan_before = Image.open(scan_before_path)
im_scan_after = Image.open(scan_after_path)
im_rad_before = Image.open(rad_before_path)
im_rad_after = Image.open(rad_after_path)

canvas_w = 2200
col_w = 1040
img_h = int(col_w * (1080 / 1920)) # 585
margin_x = 40
gap_x = 40

# Fonts
font_title = ImageFont.truetype('/usr/share/fonts/cantarell/Cantarell-VF.otf', 34)
font_sec = ImageFont.truetype('/usr/share/fonts/cantarell/Cantarell-VF.otf', 26)
font_sub = ImageFont.truetype('/usr/share/fonts/cantarell/Cantarell-VF.otf', 20)
font_foot = ImageFont.truetype('/usr/share/fonts/cantarell/Cantarell-VF.otf', 18)

# Heights
header_h = 110
sec1_title_h = 50
sub_h = 36
sec_gap = 50
footer_h = 70

canvas_h = header_h + sec1_title_h + sub_h + img_h + sec_gap + sec1_title_h + sub_h + img_h + footer_h
canvas = Image.new('RGB', (canvas_w, canvas_h), '#181d1b')
draw = ImageDraw.Draw(canvas)

# Header
draw.rectangle([0, 0, canvas_w, header_h], fill='#131715')
draw.text((margin_x, 24), "FASE 5 — COMPARATIVA DE ESCALA TIPOGRÁFICA Y CONTENEDORES (1920×1080)", fill='#e6d38a', font=font_title)
draw.text((margin_x, 68), "Auditoría visual T6: Comparativa Antes (Root 16px, contenedor fijo en px) vs Después (Root 19.52px fluido, contenedores en rem)", fill='#9eb4a9', font=font_sub)

# Draw Section 1: Escáner
y = header_h + 20
draw.text((margin_x, y), "1. ESCÁNER DE FUNCIONES — Contenedor .page--wide (67.5rem)", fill='#e8ece9', font=font_sec)
y += sec1_title_h - 10

# Column 1 header
col1_x = margin_x
col2_x = margin_x + col_w + gap_x
draw.text((col1_x, y), "ANTES · Root 16px | Max-width 1080px (fijo) | Fuente base 16px", fill='#e3a1a1', font=font_sub)
draw.text((col2_x, y), "DESPUÉS · Root 19.52px | Max-width 67.5rem (1318px fluido) | Fuente base 19.5px", fill='#aed1a2', font=font_sub)
y += sub_h

# Resize & paste Section 1 images
scan_b_resized = im_scan_before.resize((col_w, img_h), Image.Resampling.LANCZOS)
scan_a_resized = im_scan_after.resize((col_w, img_h), Image.Resampling.LANCZOS)
canvas.paste(scan_b_resized, (col1_x, y))
canvas.paste(scan_a_resized, (col2_x, y))

# Draw border around images
draw.rectangle([col1_x, y, col1_x + col_w, y + img_h], outline='#313c37', width=2)
draw.rectangle([col2_x, y, col2_x + col_w, y + img_h], outline='#313c37', width=2)

# Draw Section 2: Radiografía
y += img_h + sec_gap
draw.text((margin_x, y), "2. RADIOGRAFÍA LENTE 1 'SIGNOS' — Contenedor .page (56.25rem)", fill='#e8ece9', font=font_sec)
y += sec1_title_h - 10

draw.text((col1_x, y), "ANTES · Root 16px | Max-width 900px (fijo) | Fuente base 16px", fill='#e3a1a1', font=font_sub)
draw.text((col2_x, y), "DESPUÉS · Root 19.52px | Max-width 56.25rem (1098px fluido) | Fuente base 19.5px", fill='#aed1a2', font=font_sub)
y += sub_h

rad_b_resized = im_rad_before.resize((col_w, img_h), Image.Resampling.LANCZOS)
rad_a_resized = im_rad_after.resize((col_w, img_h), Image.Resampling.LANCZOS)
canvas.paste(rad_b_resized, (col1_x, y))
canvas.paste(rad_a_resized, (col2_x, y))

draw.rectangle([col1_x, y, col1_x + col_w, y + img_h], outline='#313c37', width=2)
draw.rectangle([col2_x, y, col2_x + col_w, y + img_h], outline='#313c37', width=2)

# Footer
y += img_h + 20
draw.rectangle([0, y, canvas_w, canvas_h], fill='#131715')
draw.text((margin_x, y + 15), "Verificación automatizada T1-T6: 0 colisiones en desktop (1280, 1920, 2560px) | 0 horizontal overflow en 6 viewports | Íconos 100% conformes | Touch targets >= 44px en mobile", fill='#7ba7c2', font=font_foot)

out_path = os.path.join(evidence_dir, 'desktop_scaling_comparison_1920.png')
canvas.save(out_path, format='PNG', optimize=True)

# Also copy to local evidence/ if exists
local_evidence = '/home/alaska45l/Projects/Math/evidence'
if os.path.exists(local_evidence):
    canvas.save(os.path.join(local_evidence, 'desktop_scaling_comparison_1920.png'), format='PNG', optimize=True)

print(f"Comparison montage saved to {out_path} with size {canvas.size}")
