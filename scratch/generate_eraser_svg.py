import math
import random

random.seed(42)

WIDTH = 1600
HEIGHT = 1200

svg_parts = [
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {HEIGHT}" width="{WIDTH}" height="{HEIGHT}">',
    '  <defs>',
    '    <filter id="felt-blur" x="-20%" y="-20%" width="140%" height="140%">',
    '      <feGaussianBlur stdDeviation="8" />',
    '    </filter>',
    '    <filter id="grain-blur" x="-20%" y="-20%" width="140%" height="140%">',
    '      <feGaussianBlur stdDeviation="0.6" />',
    '    </filter>',
    '  </defs>',
    '  <g filter="url(#felt-blur)">'
]

# Passes layout:
# Left margin: 140, 560, 800, 1040 (420px empty stretch between 140 and 560)
# Right margin: 220, 265, 640, 1050 (overlapping pair at 220 & 265, gaps 375 & 410)
passes = [
    ('left', 140, 40, 390, 1.0, 1),
    ('left', 560, 50, 420, 1.05, -1),
    ('left', 800, 60, 380, 0.95, 1),
    ('left', 1040, 40, 410, 1.0, -1),
    ('right', 220, 1200, 1550, 1.0, -1),
    ('right', 265, 1220, 1560, 0.98, 1),  # Overlapping pass
    ('right', 640, 1190, 1540, 1.02, -1),
    ('right', 1050, 1210, 1560, 0.95, 1),
]

fine_streaks = []
dust_flecks = []

for side, y_c, x0, x1, l_scale, direction in passes:
    mid_x = (x0 + x1) / 2
    curve_dip = random.uniform(8, 18) * direction
    
    # 1. Base diffuse layers (calibrated so overlap peaks <= 0.045)
    layers = [
        (56, 0.007, "210 14 35 10 15 6", 0.0, 2.4),
        (40, 0.009, "230 10 40 8 20 4", 0.0, -1.8),
        (24, 0.007, "250 16 30 12", 0.0, 0.0),
        (16, 0.003, "260 20 25 15", 0.0, 0.9),
    ]
    for w, op, dash, rot_deg, y_off in layers:
        y0_p = y_c + y_off
        y_mid_p = y_c + curve_dip * 0.4 + y_off
        y1_p = y_c + curve_dip + y_off
        d = f"M {x0:.1f} {y0_p:.1f} Q {mid_x:.1f} {y_mid_p:.1f} {x1:.1f} {y1_p:.1f}"
        svg_parts.append(
            f'    <path d="{d}" fill="none" stroke="rgb(240, 245, 240)" stroke-opacity="{op:.4f}" '
            f'stroke-width="{w}" stroke-linecap="round" stroke-dasharray="{dash}" />'
        )
    
    # 2. Fine felt marks (1.5 - 2px, opacity <= 0.025, parallel)
    for streak_off in [-9.0, 7.5]:
        s_w = random.uniform(1.4, 1.8)
        s_op = random.uniform(0.012, 0.018)
        s_dash = "140 12 60 8 25 6" if streak_off < 0 else "180 15 45 10 30 8"
        y0_s = y_c + streak_off
        y_mid_s = y_c + curve_dip * 0.4 + streak_off
        y1_s = y_c + curve_dip + streak_off
        d_streak = f"M {x0 + 10:.1f} {y0_s:.1f} Q {mid_x:.1f} {y_mid_s:.1f} {x1 - 10:.1f} {y1_s:.1f}"
        fine_streaks.append(
            f'    <path d="{d_streak}" fill="none" stroke="rgb(240, 245, 240)" stroke-opacity="{s_op:.4f}" '
            f'stroke-width="{s_w:.1f}" stroke-linecap="round" stroke-dasharray="{s_dash}" />'
        )
    
    # 3. Dust flecks in the tail
    tail_x = x1 if side == 'left' else x0
    tail_y = y_c + curve_dip
    num_flecks = random.randint(6, 11)
    for _ in range(num_flecks):
        fx = tail_x + random.uniform(-45, 45)
        fy = tail_y + random.uniform(-25, 25)
        fr = random.uniform(0.8, 1.6)
        f_op = random.uniform(0.012, 0.022)
        dust_flecks.append(
            f'    <circle cx="{fx:.1f}" cy="{fy:.1f}" r="{fr:.1f}" fill="rgb(240, 245, 240)" opacity="{f_op:.4f}" />'
        )

svg_parts.append('  </g>')
svg_parts.append('  <g filter="url(#grain-blur)">')
svg_parts.extend(fine_streaks)
svg_parts.extend(dust_flecks)
svg_parts.append('  </g>')
svg_parts.append('</svg>')

svg_content = '\n'.join(svg_parts)
svg_path = '/tmp/new_eraser_passes.svg'
with open(svg_path, 'w', encoding='utf-8') as f:
    f.write(svg_content)

print(f"Generated {svg_path} ({len(svg_content)} bytes)")
