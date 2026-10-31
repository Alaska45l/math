import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const root = path.resolve(".");
const port = 8766;
const output = path.join(root, "artifacts/potencias-raices/playwright");
fs.mkdirSync(output, { recursive: true });

const mime = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://127.0.0.1:${port}`);
  if (url.pathname === "/favicon.ico") {
    response.writeHead(204).end();
    return;
  }
  const file = path.resolve(root, `.${decodeURIComponent(url.pathname === "/" ? "/potencias-raices.html" : url.pathname)}`);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(response);
});

await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const errors = [];

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("favicon")) errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`http://127.0.0.1:${port}/potencias-raices.html`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);

  const auditHeader = async (id) => {
    await page.locator(`[data-sec="${id}"]`).click();
    await page.waitForTimeout(520);
    return page.locator(`#${id}`).evaluate((section) => {
      const title = section.querySelector("h2")?.getBoundingClientRect();
      const phrase = section.querySelector("blockquote")?.getBoundingClientRect();
      return {
        title: { top: title?.top, bottom: title?.bottom },
        phrase: { top: phrase?.top, bottom: phrase?.bottom },
        viewport: window.innerHeight,
      };
    });
  };

  const initial = await page.locator("#sec-1").evaluate((section) => {
    const title = section.querySelector("h2")?.getBoundingClientRect();
    const phrase = section.querySelector("blockquote")?.getBoundingClientRect();
    return { title: title?.toJSON(), phrase: phrase?.toJSON(), viewport: innerHeight };
  });
  assert.ok(initial.title.top >= 56 && initial.title.bottom < initial.viewport, "El título inicial queda recortado.");
  assert.ok(initial.phrase.top >= 56 && initial.phrase.bottom < initial.viewport, "La frase inicial queda recortada.");

  const headers = [];
  for (let number = 1; number <= 10; number += 1) headers.push(await auditHeader(`sec-${number}`));
  assert.ok(headers.every(({ title, phrase, viewport }) => title.top >= 56 && title.bottom < viewport && phrase.top >= 56 && phrase.bottom < viewport), "Un pizarrón deja oculto su título o frase bajo la barra.");

  await page.locator('[data-sec="sec-1"]').click();
  await page.waitForTimeout(450);
  const sidebarBefore = await page.evaluate(() => ({
    sidebar: document.querySelector(".seq-sidebar")?.getBoundingClientRect().toJSON(),
    layout: document.querySelector(".seq-layout")?.getBoundingClientRect().toJSON(),
  }));
  assert.equal(sidebarBefore.sidebar.left, 0, "El índice abierto debe tocar el borde izquierdo.");
  await page.locator("[data-sidebar-toggle]").click();
  await page.waitForTimeout(280);
  const sidebarAfter = await page.evaluate(() => ({
    sidebar: document.querySelector(".seq-sidebar")?.getBoundingClientRect().toJSON(),
    layout: document.querySelector(".seq-layout")?.getBoundingClientRect().toJSON(),
  }));
  assert.ok(sidebarAfter.sidebar.right <= 1, "El índice no se plegó fuera de la mesa.");
  assert.ok(sidebarAfter.layout.left < sidebarBefore.layout.left, "La mesa no recuperó el ancho del índice plegado.");
  await page.locator("[data-sidebar-toggle]").click();
  await page.waitForTimeout(280);

  await auditHeader("sec-5");
  await page.screenshot({ path: path.join(output, "desktop-sec5-geometria.png") });
  const geometry = await page.locator("#sec-5 [data-widget='geometria-raices']").evaluate((host) => ({
    labels: [...host.querySelectorAll("svg text")].map((node) => node.textContent).filter((text) => /1D · SEGMENTO|2D · CUADRADO|3D · CUBO/.test(text)),
    svg: host.querySelector("svg")?.getBoundingClientRect().toJSON(),
  }));
  assert.equal(geometry.labels.length, 3, "El plegador no muestra las tres dimensiones juntas.");

  await auditHeader("sec-9");
  await page.screenshot({ path: path.join(output, "desktop-sec9-maquina-real.png") });
  const mirror = await page.locator("#sec-9 [data-widget='espejo-dominio-real']").evaluate((host) => ({
    htmlSteps: host.querySelectorAll(".pr-pipe-step").length,
    largeSvgText: [...host.querySelectorAll("svg text")].some((node) => node.textContent.length > 64),
  }));
  assert.equal(mirror.htmlSteps, 6, "Las tuberías de dominio deben usar seis tarjetas HTML.");
  assert.equal(mirror.largeSvgText, false, "Quedó una oración larga dentro del SVG de dominio.");

  await auditHeader("sec-10");
  await page.screenshot({ path: path.join(output, "desktop-sec10-paradoja.png") });
  assert.equal(await page.locator(".pr-paradox-card").count(), 7, "La paradoja debe tener siete tarjetas HTML.");

  await auditHeader("sec-1");
  await page.locator("#sec-1 [data-tutor='why']").click();
  await page.waitForTimeout(260);
  assert.equal(await page.locator(".vn-hud[aria-hidden='false']").count(), 1, "La explicación abrió más de un HUD.");
  await page.locator(".vn-ctrl-btn--close").click();
  await page.locator("#sec-1 [data-gloss]").first().click();
  await page.waitForTimeout(260);
  assert.equal(await page.locator(".vn-hud[aria-hidden='false']").count(), 1, "El glosario abrió más de un HUD.");
  assert.ok(await page.locator("[data-gloss]").evaluateAll((nodes) => nodes.every((node) => node.tagName === "SPAN")), "El glosario dejó de ser inline.");

  for (let number = 1; number <= 10; number += 1) {
    await auditHeader(`sec-${number}`);
    const hint = page.locator(`#sec-${number} .pr-check__actions button:nth-child(2)`).first();
    await hint.click();
    const words = (await page.locator(`#sec-${number} .pr-check__hint`).first().textContent()).trim().split(/\s+/).length;
    assert.ok(words >= 18, `La pista de sección ${number} sigue siendo telegráfica.`);
  }

  const iconSizes = await page.locator("button svg.chalk-icon").evaluateAll((icons) => icons.map((icon) => {
    const rect = icon.getBoundingClientRect();
    return [rect.width, rect.height];
  }));
  assert.ok(iconSizes.every(([width, height]) => width <= 24 && height <= 24), "Un ícono dentro de botón fue deformado.");

  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto(`http://127.0.0.1:${port}/potencias-raices.html`, { waitUntil: "networkidle" });
    await page.waitForTimeout(220);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    assert.equal(overflow, false, `Hay overflow horizontal en ${viewport.width}px.`);
  }
  await page.screenshot({ path: path.join(output, "mobile-inicio.png") });

  assert.deepEqual(errors, [], `Errores de consola: ${errors.join(" | ")}`);
  console.log(`OK · Auditoría Playwright: 10 encabezados, sidebar, HUD, tarjetas HTML y móvil. Capturas: ${output}`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
