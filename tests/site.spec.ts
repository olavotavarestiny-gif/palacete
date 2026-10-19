import { expect, test } from "@playwright/test";

for (const width of [360, 390, 430, 768, 1024, 1440]) {
  test(`Homepage e menu sem transbordo a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    for (const route of ["/", "/menu"]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await expect(page.locator("main")).toBeVisible();
      if (route === "/") {
        const copy = await page.locator(".hero-copy-refined").boundingBox();
        const media = await page.locator(".hero-media-refined").boundingBox();
        expect(copy).not.toBeNull();
        expect(media).not.toBeNull();
        if (width >= 768) expect(copy!.x + copy!.width).toBeLessThanOrEqual(media!.x);
        else expect(copy!.y + copy!.height).toBeLessThanOrEqual(media!.y);
      }
      const broken = await page.locator("img").evaluateAll(images => (images as HTMLImageElement[]).filter(image => image.complete && image.naturalWidth === 0).map(image => image.src));
      expect(broken).toEqual([]);
    }
    expect(errors).toEqual([]);
  });
}

test("Reserva valida dados, preserva os campos após falha e só confirma a recepção depois da API", async ({ page }) => {
  await page.goto("/");
  const attempts: { key: string | undefined; data: Record<string, unknown> }[] = [];
  await page.route("**/api/reservations", async route => {
    attempts.push({ key: route.request().headers()["idempotency-key"], data: route.request().postDataJSON() });
    if (attempts.length === 1) return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Falha de ligação de demonstração. Tente novamente." }) });
    return route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ received: true, reference: "7cc5772d-dc65-40cf-b8b6-42f0f32f3b13" }) });
  });
  const reserve = page.getByRole("button", { name: "Reservar mesa", exact: true }).first();
  await reserve.click();
  const dialog = page.getByRole("dialog", { name: "O próximo momento." });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Solicitar Reserva", exact: true }).click();
  await expect(dialog.getByText("Indique o seu nome, com pelo menos 2 caracteres.")).toBeVisible();
  await expect(dialog.locator('[name="name"]')).toBeFocused();
  await dialog.getByLabel("O seu nome").fill("Visitante de Demonstração");
  await dialog.getByLabel("Número de contacto").fill("+244 923 000 000");
  await dialog.getByLabel("Data", { exact: false }).first().fill(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  await dialog.getByLabel("Horário pretendido").fill("20:00");
  await dialog.getByLabel("Número de pessoas").fill("4");
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: "Solicitar Reserva", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("Falha de ligação de demonstração.");
  await expect(dialog.getByLabel("O seu nome")).toHaveValue("Visitante de Demonstração");
  await expect(dialog.getByLabel("Número de pessoas")).toHaveValue("4");
  await expect(dialog.getByRole("status")).toHaveCount(0);
  await dialog.getByRole("button", { name: "Solicitar Reserva", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("Pedido de reserva recebido!");
  await expect(dialog.getByRole("status")).toContainText("A mesa ainda não está confirmada.");
  expect(attempts).toHaveLength(2);
  expect(attempts[0].key).toBe(attempts[1].key);
  expect(attempts[0].data).toEqual(attempts[1].data);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(reserve).toBeFocused();
});

test("O menu filtra os pratos reais e mantém os preços", async ({ page }) => {
  await page.goto("/menu");
  await expect(page.getByRole("heading", { name: "Caldo Verde" })).toBeVisible();
  await page.getByRole("button", { name: "Carne", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Caldo Verde" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Bitoque de Novilho" })).toBeVisible();
  await expect(page.locator(".menu-dish").filter({ hasText: "Bitoque de Novilho" })).toContainText(/26\s?000 Kz/);
  await page.getByRole("button", { name: "Toda a carta" }).click();
  await expect(page.locator(".menu-dish")).toHaveCount(17);
});

test("Galeria permite ampliar, navegar por teclado e fechar", async ({ page }) => {
  await page.goto("/#galeria");
  const trigger = page.getByRole("button", { name: /^Ampliar fotografia 1:/ });
  await trigger.click();
  const lightbox = page.getByRole("dialog", { name: "Galeria de fotografias do Palace Lounge" });
  await expect(lightbox).toBeVisible();
  await expect(lightbox.locator(".lightbox-top")).toContainText("01 / 06");
  await page.keyboard.press("ArrowRight");
  await expect(lightbox.locator(".lightbox-top")).toContainText("02 / 06");
  await page.keyboard.press("ArrowLeft");
  await expect(lightbox.locator(".lightbox-top")).toContainText("01 / 06");
  await page.keyboard.press("Escape");
  await expect(lightbox).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("Menu mobile abre a reserva sem deixar duas janelas abertas", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir navegação" }).click();
  const navigation = page.getByRole("dialog", { name: "Navegação", exact: true });
  await expect(navigation).toBeVisible();
  await navigation.getByRole("button", { name: "Reservar mesa" }).click();
  await expect(navigation).not.toBeVisible();
  await expect(page.getByRole("dialog", { name: "O próximo momento." })).toBeVisible();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
});

for (const kind of ["prive", "beach"] as const) {
  test(`${kind}: consentimento obrigatório e pré-visualização honesta`, async ({ page }) => {
    await page.goto("/");
    await page.locator(kind === "prive" ? "#palace-prive button" : "#palace-beach button").click();
    const dialog = page.locator(".form-dialog[open]");
    await dialog.getByLabel("O seu nome").fill("Visitante de Demonstração");
    await dialog.getByLabel("Número de WhatsApp").fill("+244 923 000 000");
    if (kind === "beach") await dialog.getByLabel("O que mais lhe interessa?").selectOption("Ambos");
    await dialog.getByRole("button", { name: /^Pré-visualizar/ }).click();
    await expect(dialog.getByText("É necessária a sua autorização para receber comunicações.")).toBeVisible();
    await dialog.getByRole("checkbox").check();
    await dialog.getByRole("button", { name: /^Pré-visualizar/ }).click();
    await expect(dialog.getByRole("status")).toContainText("Nenhuma inscrição foi efectuada.");
  });
}

test("Preferência por movimento reduzido mantém o vídeo parado", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".hero video")).not.toHaveAttribute("src");
  await expect(page.locator(".hero").getByRole("button", { name: "Reproduzir vídeo" })).toBeVisible();
  await expect(page.locator(".palace-opening")).not.toBeVisible();
});

test("A navegação principal encontra as secções sem uma segunda barra fixa", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Navegação principal", exact: true });
  await navigation.getByRole("link", { name: "O Palace", exact: true }).click();
  await expect(page).toHaveURL(/#o-palace$/);
  await navigation.getByRole("link", { name: "Experiências", exact: true }).click();
  await expect(page).toHaveURL(/#experiencias$/);
  await expect(page.locator("#experiencias")).toContainText("Quando a noite chega");
  await expect(page.locator(".chapter-navigation")).toHaveCount(0);
});

test("O menu do dia identifica a demonstração e liga à carta completa", async ({ page }) => {
  await page.goto("/#menu-do-dia");
  const daily = page.locator("#menu-do-dia");
  await expect(daily).toContainText("Pré-visualização demonstrativa");
  await expect(daily.locator("time")).toHaveAttribute("datetime", "2026-10-19");
  await expect(daily.locator(".menu-paper-dish")).toHaveCount(4);
  await expect(daily.locator(".menu-paper-dish").filter({ hasText: "Bitoque de Novilho" })).toContainText(/26\s?000 Kz/);
  await daily.getByRole("link", { name: "Consultar o menu completo" }).click();
  await expect(page).toHaveURL(/\/menu$/);
});

test("As ocasiões continuam a preencher o pedido de reserva", async ({ page }) => {
  await page.goto("/");
  await page.locator(".night-occasions").getByRole("button", { name: /Celebrações/ }).click();
  const dialog = page.getByRole("dialog", { name: "O próximo momento." });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Ocasião")).toHaveValue("Celebração");
});

test("O controlo de vídeo mobile fica acessível fora do painel de texto", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const hero = page.locator(".hero");
  await hero.getByRole("button", { name: "Reproduzir vídeo" }).click();
  await expect(hero.getByRole("button", { name: "Pausar vídeo" })).toBeVisible();
  await hero.getByRole("button", { name: "Pausar vídeo" }).click();
  await expect(hero.locator("video")).toHaveJSProperty("paused", true);
});

test("A abertura termina automaticamente e não bloqueia o scroll", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".palace-opening")).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe("hidden");
  await expect(page.locator(".palace-opening")).not.toBeVisible({ timeout: 2800 });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("A abertura pode ser ignorada imediatamente", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Ignorar abertura" }).click();
  await expect(page.locator(".palace-opening")).not.toBeVisible({ timeout: 700 });
});

test("A navegação por teclado dispensa a abertura sem capturar o foco", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.keyboard.press("Tab");
  await expect(page.locator(".palace-opening")).not.toBeVisible();
  await expect(page.getByRole("link", { name: "Saltar para o conteúdo" })).toBeFocused();
});

for (const width of [360, 390, 430]) {
  test(`A abertura funciona num telemóvel com toque a ${width}px`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: "no-preference" });
    try {
      const page = await context.newPage();
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await expect(page.locator(".palace-opening")).toBeVisible();
      await expect(page.locator(".opening-panel")).toHaveCount(2);
      const logo = await page.locator(".opening-art").first().boundingBox();
      expect(logo!.width).toBeGreaterThanOrEqual(250);
      if (width === 390) {
        await page.getByRole("button", { name: "Ignorar abertura" }).tap();
        await expect(page.locator(".palace-opening")).not.toBeVisible();
      } else {
        await expect(page.locator(".palace-opening")).not.toBeVisible({ timeout: 2800 });
      }
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    } finally { await context.close(); }
  });
}

test("O vídeo espera por ficar visível e pára quando sai do ecrã", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 430 });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".palace-opening")).not.toBeVisible();
  const video = page.locator(".hero video");
  await expect(video).not.toHaveAttribute("src");
  await page.locator(".hero-media-refined").scrollIntoViewIfNeeded();
  await expect(video).toHaveAttribute("src", /palace-gastronomia\.mp4$/);
  await expect(video).toHaveJSProperty("paused", false);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(video).toHaveJSProperty("paused", true);
});

test("O vídeo permite pedidos parciais e reutilização de cache", async ({ request }) => {
  const response = await request.get("/media/videos/palace-gastronomia.mp4", { headers: { Range: "bytes=0-1023" } });
  expect(response.status()).toBe(206);
  expect((await response.body()).length).toBe(1024);
  expect(response.headers()["cache-control"]).toContain("max-age=86400");
});
