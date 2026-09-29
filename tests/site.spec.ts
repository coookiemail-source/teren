import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const routes = ['/', '/projects/', '/projects/residence-01/', '/projects/quiet-interior/', '/projects/water-pavilion/', '/services/', '/studio/', '/contact/', '/404/'];
const widths = [320,360,390,768,1024,1440,1920];

test('Every page: metadata, images, seven viewports and visual captures', async ({ page }) => {
  await fs.mkdir('.qa', { recursive: true });
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toHaveCount(1);
    titles.add(await page.title());
    descriptions.add(await page.locator('meta[name=description]').getAttribute('content') || '');
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex, nofollow');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', await page.title());
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://teren-architecture.sweet-hake-2744.chatgpt.site${route}`);
    await page.locator('img').evaluateAll(async images => { await Promise.all(images.map(async image => { if (image instanceof HTMLImageElement) { image.loading = 'eager'; await image.decode(); } })); });
    expect(await page.locator('img').evaluateAll(images => images.every(image => image instanceof HTMLImageElement && image.naturalWidth > 0 && !!image.alt && !!image.srcset))).toBe(true);
    const name = route === '/' ? 'home' : route.replaceAll('/','-');
    for (const width of widths) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} at ${width}px`).toBe(true);
      if (width === 390 || width === 1440) {
        await page.locator('img').evaluateAll(async images => { await Promise.all(images.map(image => image instanceof HTMLImageElement ? image.decode() : Promise.resolve())); });
        await page.screenshot({path: `.qa/${name}-${width}.png`, fullPage:true});
        if(route === '/') await page.screenshot({path:`.qa/hero-${width}.png`});
      }
    }
  }
  expect(titles.size).toBe(routes.length);
  expect(descriptions.size).toBe(routes.length);
  expect(errors).toEqual([]);
});

test('Mobile menu: keyboard, focus trap, Escape, resize and navigation', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  const button = page.getByRole('button',{name:'Меню',exact:true});
  await button.focus(); await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-expanded','true');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(()=>!!document.activeElement?.closest('dialog'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(button).toBeFocused();
  await expect(button).toHaveAttribute('aria-expanded','false');
  await button.click();
  await page.setViewportSize({width:1024,height:900});
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.setViewportSize({width:390,height:844});
  await button.click();
  await page.getByRole('dialog').getByRole('link',{name:'Студия',exact:true}).click();
  await expect(page).toHaveURL(/\/studio\/$/);
});

test('Contact form: invalid input, valid result and no transmission or storage', async ({page,context})=>{
  await page.goto('/contact/');
  await page.locator('button[type=submit]').click();
  await expect(page.locator('input[name=name]')).toBeFocused();
  await expect(page.locator('#form-status')).not.toBeVisible();
  await page.getByLabel('Как к вам обращаться').fill('Тестовый посетитель');
  await page.getByLabel('Электронная почта').fill('demo@example.com');
  await page.getByLabel('Что планируете?').selectOption({label:'Частный дом'});
  await page.getByLabel('Несколько слов о проекте').fill('Демонстрационная концепция дома площадью 200 м².');
  await page.getByRole('checkbox').check();
  const submitted: string[]=[];
  page.on('request',request=>{if(request.method()!=='GET'||request.isNavigationRequest())submitted.push(request.url());});
  await page.locator('button[type=submit]').click();
  await expect(page.locator('#form-status')).toContainText('никуда не отправлены');
  await expect(page.locator('#form-status')).toBeFocused();
  expect(submitted).toEqual([]);
  expect(await page.evaluate(()=>localStorage.length+sessionStorage.length)).toBe(0);
  expect(await context.cookies()).toEqual([]);
});

test('Project scroll index, services keyboard controls and reduced motion',async({page})=>{
  await page.goto('/');
  await page.locator('#selected-02').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-project-link="02"]')).toHaveClass('active');
  expect(await page.locator('.home-hero h1 .line').first().evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  await page.goto('/services/');
  const summary = page.locator('summary').first();
  await summary.focus();await page.keyboard.press('Enter');
  await expect(page.locator('details').first()).toHaveAttribute('open','');
  await page.keyboard.press('Enter');
  await expect(page.locator('details').first()).not.toHaveAttribute('open');
});

test('All internal links and custom 404 route',async({page,request})=>{
  const links = new Set<string>();
  for(const route of routes){await page.goto(route);for(const link of await page.locator('a[href]').evaluateAll(anchors=>anchors.map(a=>a.getAttribute('href')||'')))if(link.startsWith('/')&&!link.startsWith('//'))links.add(link);}
  for(const link of links){const response=await request.get(link.split('#')[0]);expect(response.status(),link).toBe(200);}
  expect((await page.goto('/this-page-does-not-exist/'))?.status()).toBe(404);
  await expect(page.getByRole('heading',{level:1})).toHaveText('Здесь пока пусто.');
});

test('Content available without JavaScript, demo form disabled',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const page=await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading',{level:1})).toBeVisible();
  await page.getByRole('link',{name:'Смотреть проекты',exact:true}).click();
  await expect(page.locator('.editorial-project')).toHaveCount(3);
  await page.goto('/contact/');
  await expect(page.locator('button[type=submit]')).toBeDisabled();
  await context.close();
});

test('Motion enabled keeps hero and projects readable',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await page.locator('#selected-03').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-project-link="03"]')).toHaveClass('active');
  expect(await page.evaluate(()=>getComputedStyle(document.body).overflowY)).not.toBe('hidden');
});
