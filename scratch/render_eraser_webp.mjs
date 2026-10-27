import fs from 'node:fs';
import { chromium } from '/home/alaska45l/Projects/Math/node_modules/playwright/index.mjs';
import { execSync } from 'node:child_process';

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 1 });

const svg = fs.readFileSync('/tmp/new_eraser_passes.svg', 'utf-8');
await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;overflow:hidden;background:transparent;">${svg}</body></html>`);
await page.waitForTimeout(500);

const pngBuffer = await page.screenshot({ omitBackground: true, type: 'png' });
fs.writeFileSync('/tmp/new_eraser_passes.png', pngBuffer);
await browser.close();

// Now analyze alpha and save webp via Python
execSync(`python -c '
import numpy as np
from PIL import Image

im = Image.open("/tmp/new_eraser_passes.png")
arr = np.array(im)
alpha = arr[:, :, 3]
peak_alpha = alpha.max()
peak_ratio = peak_alpha / 255.0

print(f"Rasterized 1600x1200 PNG: Peak alpha = {peak_alpha} / 255 ({peak_ratio * 100:.2f}%)")
assert peak_ratio <= 0.05, f"Peak alpha {peak_ratio} exceeds 0.05 limit!"

# Save as WebP
im.save("css/chalkboard-eraser.webp", "WEBP", quality=100, lossless=True)
print(f"Saved css/chalkboard-eraser.webp ({os.path.getsize(\"css/chalkboard-eraser.webp\")} bytes)")
'`);
