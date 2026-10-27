import math
import re
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

f_cav = TTFont('/tmp/caveat-latin.ttf')
f_stix = TTFont('/tmp/STIXTwoMath-Regular.otf')
cmap_cav = f_cav.getBestCmap()
cmap_stix = f_stix.getBestCmap()
gset_cav = f_cav.getGlyphSet()
gset_stix = f_stix.getGlyphSet()

def render_formula(formula, x0, y0, font_size=24, angle_deg=0.0):
    svg_pen = SVGPathPen(None)
    rad = math.radians(angle_deg)
    cos_a = math.cos(rad)
    sin_a = math.sin(rad)
    base_scale = font_size / 1000.0
    
    tokens = []
    i = 0
    while i < len(formula):
        if formula[i] == '^':
            i += 1
            if i < len(formula) and formula[i] == '{':
                end = formula.find('}', i)
                if end != -1:
                    tokens.append(('sup', formula[i+1:end]))
                    i = end + 1
                else:
                    tokens.append(('sup', formula[i]))
                    i += 1
            else:
                tokens.append(('sup', formula[i]))
                i += 1
        elif formula[i] == '_':
            i += 1
            if i < len(formula) and formula[i] == '{':
                end = formula.find('}', i)
                if end != -1:
                    tokens.append(('sub', formula[i+1:end]))
                    i = end + 1
                else:
                    tokens.append(('sub', formula[i]))
                    i += 1
            else:
                tokens.append(('sub', formula[i]))
                i += 1
        else:
            tokens.append(('norm', formula[i]))
            i += 1
            
    cur_x = 0
    for mode, text in tokens:
        sub_scale = base_scale * 0.7 if mode in ('sub', 'sup') else base_scale
        y_shift = 380 if mode == 'sup' else (-220 if mode == 'sub' else 0)
        
        for ch in text:
            code = ord(ch)
            if ch == ' ':
                cur_x += 320 * (sub_scale / base_scale)
                continue
            if code in cmap_cav:
                font = f_cav
                gset = gset_cav
                gname = cmap_cav[code]
                adv = font['hmtx'][gname][0]
            elif code in cmap_stix:
                font = f_stix
                gset = gset_stix
                gname = cmap_stix[code]
                adv = font['hmtx'][gname][0] * 0.95
            else:
                print(f'Warning: glyph not found for {ch} (U+{ord(ch):04X})')
                continue
            
            xx = sub_scale * cos_a
            xy = -sub_scale * sin_a
            yx = -sub_scale * sin_a
            yy = -sub_scale * cos_a
            
            dx = x0 + base_scale * (cur_x * cos_a - y_shift * sin_a)
            dy = y0 - base_scale * (cur_x * sin_a + y_shift * cos_a)
            
            tpen = TransformPen(svg_pen, (xx, xy, yx, yy, dx, dy))
            gset[gname].draw(tpen)
            cur_x += adv * (sub_scale / base_scale)
            
    raw_d = svg_pen.getCommands()
    # round decimals to 1 place to keep SVG slim
    clean_d = re.sub(r'(\d+\.\d)\d+', r'\1', raw_d)
    return clean_d

formulas = [
    # Row 1 (y ~ 75-80)
    ('F = m · a', 60, 80, 22, -1.2),
    ('∇ × E = −∂B/∂t', 340, 78, 24, 1.5),
    ('e^{iπ} + 1 = 0', 760, 80, 25, -0.9),
    ('v = d / t', 1040, 75, 20, 1.1),

    # Row 2 (y ~ 190-200)
    ('d/dx (x³) = 3x²', 60, 195, 21, 1.4),
    ('iℏ ∂ψ/∂t = Ĥψ', 380, 198, 25, -1.5),
    ('∇ · B = 0', 780, 195, 24, 1.2),
    ('λ = h / p', 1030, 192, 21, -1.0),

    # Row 3 (y ~ 310-320)
    ('E = mc²', 80, 315, 26, 0.9),
    ('∮_{∂Σ} ω = ∫_Σ dω', 360, 318, 24, -1.3),
    ('K = ½ m · v²', 800, 315, 22, 1.6),

    # Row 4 (y ~ 440-450)
    ('dU = T dS − P dV', 60, 445, 22, -1.1),
    ('∫_{−∞}^∞ e^{−x²} dx = √π', 380, 448, 25, 1.4),
    ('W = F · d', 900, 442, 21, -1.4),

    # Row 5 (y ~ 560-570)
    ('∑ 1/n² = π²/6', 80, 565, 25, 1.5),
    ('G_{μν} + Λg_{μν} = κT_{μν}', 420, 568, 24, -1.2),
    ('p = m · v', 930, 562, 20, 0.8),

    # Row 6 (y ~ 680-690)
    ('Δx · Δp ≥ ℏ/2', 70, 685, 24, -1.4),
    ('ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ', 400, 688, 23, 1.2),
    ('S = k_B ln Ω', 880, 684, 24, -0.9),

    # Row 7 (y ~ 800-810)
    ('F = G (m₁m₂)/r²', 70, 805, 23, 1.3),
    ('(a + b)² = a² + 2ab + b²', 430, 808, 22, -1.3),
    ('c = 1 / √(μ₀ ε₀)', 860, 804, 22, 1.0),
]

svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900" role="img" aria-label="Textura de pizarrón con fórmulas matemáticas medio borradas">
  <defs>
    <!-- Grano fino de tiza/pizarra -->
    <filter id="chalk-dust-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" result="noise" />
      <feColorMatrix type="matrix" values="1 0 0 0 1  0 1 0 0 1  0 0 1 0 1  0 0 0 0.035 0" />
    </filter>

    <!-- Máscara de borrador: las zonas negras desvanecen las fórmulas sin pintar formas oscuras -->
    <mask id="ghost-erase-mask">
      <rect width="100%" height="100%" fill="white" />
      <!-- Pasadas de borrador que cortan tramos de fórmulas limpiamente -->
      <path d="M 90 75 Q 160 72 240 76" stroke="black" stroke-width="32" stroke-linecap="round" opacity="0.95" />
      <path d="M 490 195 Q 580 193 670 196" stroke="black" stroke-width="34" stroke-linecap="round" opacity="0.9" />
      <path d="M 120 305 Q 185 307 250 304" stroke="black" stroke-width="32" stroke-linecap="round" opacity="0.95" />
      <path d="M 520 445 Q 600 447 685 444" stroke="black" stroke-width="34" stroke-linecap="round" opacity="0.9" />
      <path d="M 180 555 Q 260 558 350 554" stroke="black" stroke-width="32" stroke-linecap="round" opacity="0.92" />
      <path d="M 440 685 Q 530 682 620 686" stroke="black" stroke-width="32" stroke-linecap="round" opacity="0.95" />
      <path d="M 850 798 Q 930 801 1020 797" stroke="black" stroke-width="34" stroke-linecap="round" opacity="0.9" />
      <!-- Desvanecimientos suaves en franjas horizontales típicas de borrado en pizarrón -->
      <path d="M 0 200 Q 400 180 800 220 T 1200 190" stroke="black" stroke-width="45" stroke-linecap="round" opacity="0.45" />
      <path d="M 0 570 Q 500 540 1000 580" stroke="black" stroke-width="50" stroke-linecap="round" opacity="0.4" />
    </mask>

    <style>
      .ghost-path {
        fill: rgba(240, 245, 240, 0.035);
        user-select: none;
        pointer-events: none;
      }
      .ghost-draw {
        fill: none;
        stroke: rgba(240, 245, 240, 0.032);
        stroke-width: 1.4;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .wipe-streak {
        fill: none;
        stroke: rgba(255, 255, 255, 0.013);
        stroke-linecap: round;
      }
    </style>
  </defs>

  <!-- Grano de polvo sobre toda la superficie -->
  <rect width="100%" height="100%" filter="url(#chalk-dust-grain)" />

  <!-- Huellas suaves de borrado con tiza blanca difusa (residuo seco de borrador) -->
  <g>
    <path d="M 0 140 Q 300 110 650 150 T 1200 130" class="wipe-streak" stroke-width="80" />
    <path d="M 0 380 Q 400 420 800 360 T 1200 400" class="wipe-streak" stroke-width="95" />
    <path d="M 0 680 Q 350 630 750 690 T 1200 660" class="wipe-streak" stroke-width="90" />
    <path d="M 120 0 Q 360 450 600 900" class="wipe-streak" stroke-width="70" />
    <path d="M 720 0 Q 890 400 1080 900" class="wipe-streak" stroke-width="75" />
  </g>

  <!-- Fórmulas vectoriales medio borradas (enmascaradas) -->
  <g class="ghost-path" mask="url(#ghost-erase-mask)">
"""

# Append diagrams
diagrams = """    <!-- Diagrama: Triángulo y Pitágoras -->
    <g transform="translate(230, 70)">
      <polygon points="0,40 50,40 50,10" class="ghost-draw" />
    </g>

    <!-- Diagrama: Parábola en mini-ejes -->
    <g transform="translate(200, 390)">
      <line x1="-40" y1="0" x2="50" y2="0" class="ghost-draw" />
      <line x1="0" y1="35" x2="0" y2="-40" class="ghost-draw" />
      <path d="M -30 -25 Q 0 25 30 -25" class="ghost-draw" />
      <circle cx="10" cy="5" r="2.5" fill="rgba(240,245,240,0.035)" />
    </g>

    <!-- Diagrama: Campana normal -->
    <g transform="translate(680, 760)">
      <line x1="-60" y1="0" x2="70" y2="0" class="ghost-draw" />
      <path d="M -55 0 Q -18 -30 0 -30 Q 18 -30 55 0" class="ghost-draw" />
    </g>
"""

svg_content += diagrams

print("Rendering formulas to vector paths...")
for form, x, y, size, angle in formulas:
    d = render_formula(form, x, y, size, angle)
    svg_content += f'    <!-- {form} -->\n    <path d="{d}" />\n'

svg_content += """  </g>
</svg>
"""

with open('css/chalkboard-ghosts.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content)

print(f"Generated css/chalkboard-ghosts.svg successfully ({len(svg_content)} bytes)")
