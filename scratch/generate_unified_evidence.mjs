import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(process.cwd(), reqPath);
  if (!fs.existsSync(filePath)) {
    res.statusCode = 404;
    return res.end('Not found');
  }
  const ext = path.extname(filePath);
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.woff2': 'font/woff2',
    '.svg': 'image/svg+xml'
  };
  res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
});

const PORT = 8179;
await new Promise(r => server.listen(PORT, r));

const tmpDir = path.join(process.cwd(), 'scratch/evidence_parts');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });

// 1. Evidence 8a: Pin / Hueco at DPR 3
console.log('Capturing 8a (Pin / Hueco DPR 3)...');
{
  const page = await browser.newPage({ viewport: { width: 900, height: 600 }, deviceScaleFactor: 3 });
  await page.goto(`http://localhost:${PORT}/unidades.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const legend = await page.$('.dim-legend');
  await legend.screenshot({ path: path.join(tmpDir, '8a_pin_hueco.png') });
  await page.close();
}

// 2. Evidence 8b: Riel on chalkboard without patch
console.log('Capturing 8b (Riel on chalkboard without patch)...');
{
  const page = await browser.newPage({ viewport: { width: 900, height: 600 }, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:${PORT}/sucesiones.html`, { waitUntil: 'networkidle' });
  await page.click('#tab-postes');
  await page.waitForSelector('#seq-track');
  await page.evaluate(() => document.fonts.ready);
  const track = await page.$('.seq-track-wrap');
  await track.screenshot({ path: path.join(tmpDir, '8b_riel.png') });
  await page.close();
}

// 3. Evidence 8c: TCP row 2 at 390px
console.log('Capturing 8c (TCP row 2 at 390px)...');
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:${PORT}/funciones.html`, { waitUntil: 'networkidle' });
  await page.click('#tab-secante');
  await page.waitForTimeout(300);
  await page.evaluate(() => document.fonts.ready);
  const row2 = (await page.$$('.tcp-row'))[1];
  await row2.screenshot({ path: path.join(tmpDir, '8c_tcp_row2.png') });
  await page.close();
}

// 4. 22 Laws from real nav
console.log('Capturing 22 laws from real nav...');
{
  const page = await browser.newPage({ viewport: { width: 850, height: 600 }, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const { FUNDAMENTAL_LAWS } = await import('../js/core/nav.js');

  for (let i = 0; i < FUNDAMENTAL_LAWS.length; i++) {
    const law = FUNDAMENTAL_LAWS[i];
    await page.evaluate(({ html, name }) => {
      const brand = document.querySelector('.site-nav__brand');
      brand.innerHTML = html;
      brand.title = name;
    }, law);
    await page.waitForTimeout(80);

    const navBrand = await page.$('.site-nav');
    await navBrand.screenshot({ path: path.join(tmpDir, `law_${String(i).padStart(2, '0')}.png`) });
  }
  await page.close();
}

await browser.close();
server.close();
console.log('All parts captured! Assembling unified image with Python PIL...');

// Stitch with Python PIL
execSync(`python3 -c "
from PIL import Image, ImageDraw, ImageFont
import os

tmp_dir = 'scratch/evidence_parts'
im_8a = Image.open(f'{tmp_dir}/8a_pin_hueco.png')
im_8b = Image.open(f'{tmp_dir}/8b_riel.png')
im_8c = Image.open(f'{tmp_dir}/8c_tcp_row2.png')

# Scale 8a slightly if needed so heights harmonize
# Target height for top row elements ~ 260px
h_top = 280
def fit_height(im, th):
    ratio = th / im.size[1]
    return im.resize((int(im.size[0] * ratio), th), Image.Resampling.LANCZOS)

# 8b is already around 260-320px
# Let's keep native proportions but ensure total top row width fits ~ 1800-2000px
target_top_w = 1900
scale_factor = 0.8
im_8a_s = im_8a.resize((int(im_8a.size[0]*0.55), int(im_8a.size[1]*0.55)), Image.Resampling.LANCZOS)
im_8b_s = im_8b.resize((int(im_8b.size[0]*0.75), int(im_8b.size[1]*0.75)), Image.Resampling.LANCZOS)
im_8c_s = im_8c.resize((int(im_8c.size[0]*0.85), int(im_8c.size[1]*0.85)), Image.Resampling.LANCZOS)

top_h = max(im_8a_s.size[1], im_8b_s.size[1], im_8c_s.size[1]) + 40
top_w = im_8a_s.size[0] + im_8b_s.size[0] + im_8c_s.size[0] + 60

# Laws: 22 laws in 2 columns (11 per column)
laws = [Image.open(f'{tmp_dir}/law_{i:02d}.png') for i in range(22)]
# Resize each law navbar to width ~ 900px
law_w = 920
law_h = int(laws[0].size[1] * (law_w / laws[0].size[0]))
laws_s = [im.resize((law_w, law_h), Image.Resampling.LANCZOS) for im in laws]

col_w = law_w
bottom_w = col_w * 2 + 30
bottom_h = law_h * 11 + 20

canvas_w = max(top_w, bottom_w) + 40
canvas_h = top_h + bottom_h + 80

# Chalkboard dark green background: #26352d -> (38, 53, 45)
canvas = Image.new('RGB', (canvas_w, canvas_h), (38, 53, 45))
draw = ImageDraw.Draw(canvas)

# Title Top Row
y_cursor = 15
draw.text((30, y_cursor), 'EVIDENCIAS COMMIT 0: 8a (Pin/Hueco DPR 3) · 8b (Riel en pizarra sin parche) · 8c (TCP Fila 2 a 390px)', fill=(236, 232, 220))
y_cursor += 30

# Paste top row
x_cursor = 30
# 8a
canvas.paste(im_8a_s, (x_cursor, y_cursor + (top_h - 40 - im_8a_s.size[1])//2))
x_cursor += im_8a_s.size[0] + 30

# 8b
canvas.paste(im_8b_s, (x_cursor, y_cursor + (top_h - 40 - im_8b_s.size[1])//2))
x_cursor += im_8b_s.size[0] + 30

# 8c
canvas.paste(im_8c_s, (x_cursor, y_cursor + (top_h - 40 - im_8c_s.size[1])//2))

y_cursor += top_h

# Divider line
draw.line([(30, y_cursor), (canvas_w - 30, y_cursor)], fill=(169, 179, 166), width=1)
y_cursor += 15

# Title Bottom Row
draw.text((30, y_cursor), '22 LEYES FUNDAMENTALES RENDERIZADAS EN NAVBAR REAL (2 COLUMNAS)', fill=(236, 232, 220))
y_cursor += 30

# Paste 22 laws: col 0 = laws 0..10, col 1 = laws 11..21
x_col0 = 30
x_col1 = 30 + col_w + 30

for row in range(11):
    idx0 = row
    idx1 = row + 11
    canvas.paste(laws_s[idx0], (x_col0, y_cursor + row * law_h))
    if idx1 < 22:
        canvas.paste(laws_s[idx1], (x_col1, y_cursor + row * law_h))

out_dir = 'screenshots'
os.makedirs(out_dir, exist_ok=True)
out_file = f'{out_dir}/evidence_unified.png'
# Ensure max dimension <= 2400px
max_dim = max(canvas.size)
if max_dim > 2400:
    ratio = 2400.0 / max_dim
    canvas = canvas.resize((int(canvas.size[0] * ratio), int(canvas.size[1] * ratio)), Image.Resampling.LANCZOS)

canvas.save(out_file)
print(f'Successfully assembled {out_file}: {canvas.size[0]}x{canvas.size[1]} px (max dim <= 2400)')
"`);
