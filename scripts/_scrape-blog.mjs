import { chromium } from "playwright";

const BASE_URL = "https://vmtravel.com.vn/blog/";

async function scrapeBlogPage(page, url) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);

  const posts = await page.evaluate(() => {
    const items = document.querySelectorAll("article, .post-item, .blog-item, [class*='post'], [class*='blog']");
    const results = [];
    const seen = new Set();

    items.forEach((el) => {
      const link = el.querySelector("a[href*='/blog/']") || el.querySelector("a[href*='blog']");
      const titleEl = el.querySelector("h2, h3, h4, .title, .post-title, .entry-title");
      const imgEl = el.querySelector("img");
      const descEl = el.querySelector("p, .excerpt, .description, .post-excerpt");
      const dateEl = el.querySelector("time, .date, .post-date, .meta-date");

      const href = link?.getAttribute("href");
      if (!href || seen.has(href)) return;
      seen.add(href);

      results.push({
        title: titleEl?.textContent?.trim() || "",
        url: href.startsWith("http") ? href : `https://vmtravel.com.vn${href}`,
        image: imgEl?.getAttribute("src") || "",
        description: descEl?.textContent?.trim() || "",
        date: dateEl?.textContent?.trim() || "",
      });
    });
    return results;
  });

  return posts;
}

async function scrapeBlogDetail(page, url) {
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1500);

    return await page.evaluate(() => {
      const getText = (sel) => document.querySelector(sel)?.textContent?.trim() || "";

      const title = getText("h1") || getText(".entry-title") || getText(".post-title");
      const contentEl = document.querySelector("article, .entry-content, .post-content, .blog-content, main");
      const content = contentEl?.textContent?.trim() || "";
      const dateEl = document.querySelector("time")?.getAttribute("datetime") || getText("time") || getText(".post-date") || getText(".entry-date");
      const author = getText(".author, .post-author, .entry-author, .byline");

      return { title, content, date: dateEl, author };
    });
  } catch {
    return null;
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" });
  const page = await context.newPage();

  console.log("Scraping blog list from", BASE_URL);
  const posts = await scrapeBlogPage(page, BASE_URL);
  console.log(`Found ${posts.length} blog posts on listing page\n`);

  // Also try page 2
  const posts2 = await scrapeBlogPage(page, "https://vmtravel.com.vn/blog/page/2/");
  console.log(`Found ${posts2.length} blog posts on page 2\n`);
  const allPosts = [...posts, ...posts2];

  // Scrape detail for each
  const enriched = [];
  for (let i = 0; i < allPosts.length; i++) {
    const p = allPosts[i];
    process.stdout.write(`Scraping ${i + 1}/${allPosts.length}: ${p.title || p.url} ... `);
    const detail = await scrapeBlogDetail(page, p.url);
    if (detail) {
      enriched.push({ ...p, ...detail });
      process.stdout.write(`${detail.title}\n`);
    } else {
      enriched.push(p);
      process.stdout.write("(no detail)\n");
    }
    // Small delay to be polite
    await new Promise((r) => setTimeout(r, 1000));
  }

  // Output JSON
  console.log("\n=== SCRAPED BLOG POSTS ===");
  console.log(JSON.stringify(enriched, null, 2));

  await browser.close();
})().catch((e) => {
  console.error("Scrape failed:", e);
  process.exit(1);
});
