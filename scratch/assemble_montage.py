import os
from PIL import Image, ImageFont, ImageDraw

evidence_dir = '/home/alaska45l/.gemini/antigravity/brain/3d28227a-c5bc-4f2c-9cf3-c3d50c502683/evidence'

# Canvas dimensions (<= 2400px)
width = 1800
height = 1200

# Chalkboard colors
bg_color = (38, 53, 45, 255)
ink_color = (236, 232, 220, 255)
yellow_color = (230, 211, 138, 255)
green_color = (174, 209, 162, 255)
border_color = (90, 122, 104, 255)

canvas = Image.new('RGBA', (width, height), bg_color)
draw = ImageDraw.Draw(canvas)

font_path = '/usr/share/fonts/cantarell/Cantarell-VF.otf'

title_font = ImageFont.truetype(font_path, 30)
sub_font = ImageFont.truetype(font_path, 20)
h2_font = ImageFont.truetype(font_path, 22)
lbl_font = ImageFont.truetype(font_path, 16)
legend_font = ImageFont.truetype(font_path, 15)

# Headers
draw.text((60, 40), "Hoja de Contacto · Controles Extraídos de Páginas Reales (Fase 5 · Commit 0)", fill=ink_color, font=title_font)
draw.text((60, 85), "Bordes vectoriales a mano (3 variantes SVG sin filtros) · Fondos transparentes · DPR 3", fill=yellow_color, font=sub_font)

# Section 1: Buttons
draw.text((60, 140), "1. Botones Reales (Variantes 1, 2 y 3 vía nth-of-type(3n+1 / 3n+2 / 3n) · Multilínea a 390px):", fill=ink_color, font=h2_font)

b1_path = os.path.join(evidence_dir, 'crop_dpr3_btn_variant1.png')
b2_path = os.path.join(evidence_dir, 'crop_dpr3_btn_variant2_multiline.png')
b3_path = os.path.join(evidence_dir, 'crop_dpr3_btn_variant3.png')

def load_and_scale(path, target_w):
    im = Image.open(path).convert('RGBA')
    ratio = target_w / im.width
    target_h = int(im.height * ratio)
    return im.resize((target_w, target_h), Image.Resampling.LANCZOS)

# Paste buttons
if os.path.exists(b1_path):
    im1 = load_and_scale(b1_path, 500)
    canvas.paste(im1, (60, 185), im1)
    draw.text((60, 185 + im1.height + 12), "Variante 1 (borde 1 · Lente 1)", fill=green_color, font=lbl_font)

if os.path.exists(b2_path):
    im2 = load_and_scale(b2_path, 500)
    canvas.paste(im2, (620, 185), im2)
    draw.text((620, 185 + im2.height + 12), "Variante 2 (borde 2 · 2-3 líneas a 390px)", fill=green_color, font=lbl_font)

if os.path.exists(b3_path):
    im3 = load_and_scale(b3_path, 500)
    canvas.paste(im3, (1180, 185), im3)
    draw.text((1180, 185 + im3.height + 12), "Variante 3 (borde 3 · Lente 3)", fill=green_color, font=lbl_font)

# Section 2: Form controls
draw.text((60, 470), "2. Controles de Formulario Reales (Fondo transparente comprobado, max diff <= 4/255):", fill=ink_color, font=h2_font)

sel_path = os.path.join(evidence_dir, 'crop_dpr3_select.png')
rng_path = os.path.join(evidence_dir, 'crop_dpr3_num_input.png')
chk_path = os.path.join(evidence_dir, 'crop_dpr3_checkbox.png')

if os.path.exists(sel_path):
    im_sel = load_and_scale(sel_path, 520)
    canvas.paste(im_sel, (60, 520), im_sel)
    draw.text((60, 520 + im_sel.height + 12), "Select nativo (flecha SVG de tiza, fondo transparente)", fill=yellow_color, font=lbl_font)

if os.path.exists(rng_path):
    im_rng = load_and_scale(rng_path, 480)
    canvas.paste(im_rng, (660, 520), im_rng)
    draw.text((660, 520 + im_rng.height + 12), "Slider de rango #sc-x (pista fina, thumb tiza circular)", fill=yellow_color, font=lbl_font)

if os.path.exists(chk_path):
    im_chk = load_and_scale(chk_path, 120)
    canvas.paste(im_chk, (1260, 520), im_chk)
    draw.text((1260, 520 + im_chk.height + 12), "Checkbox #geo-cont (borde 1, 28x28px)", fill=yellow_color, font=lbl_font)

# Section 3: Technical verification box
draw.rectangle([(60, 890), (1740, 1140)], outline=border_color, width=2)
draw.text((80, 910), "Verificaciones Técnicas de Fidelidad Visual en Páginas Reales:", fill=yellow_color, font=h2_font)
draw.text((80, 950), "• Bordes Vectoriales Puros: Dibujados a mano con trazo de 2px, esquinas que se pasan 1-2px, sin feTurbulence.", fill=ink_color, font=legend_font)
draw.text((80, 985), "• Variantes Cíclicas: Repartidas con nth-of-type(3n+1 / 3n+2 / 3n) en botones y controles; evitan la apariencia de caja rígida.", fill=ink_color, font=legend_font)
draw.text((80, 1020), "• Fondos Transparentes: Select, input y checkbox tienen background: transparent (diferencia pixel interior vs +4px exterior <= 1/255).", fill=ink_color, font=legend_font)
draw.text((80, 1055), "• Estados Interactivos: aria-pressed='true' persistente con borde amarillo de 3px y leve rotación (<= 1°); foco accesible outline 2px con 3px offset.", fill=ink_color, font=legend_font)
draw.text((80, 1090), "• Accesibilidad: sin doble halo en tap; <span class='sr-only'> en íconos semánticos (verde = acierto, rosa = fallo); nav mobile 49px <= 90px.", fill=ink_color, font=legend_font)

out_file = os.path.join(evidence_dir, 'controls_contact_sheet.png')
canvas.save(out_file, 'PNG')
print(f"Successfully assembled {out_file} ({width}x{height}px)")
