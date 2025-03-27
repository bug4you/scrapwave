import Scrapper from "./scrapper";

// 📌 URL to'liq shaklda yoki nisbiy ekanligini tekshirish
export function isAbsoluteUrl(url: string): boolean {
  return /^(https?:)?\/\//.test(url);
}

// 📌 Sahifadagi barcha rasm linklarini olish
export function getImageLinks(scraper: Scrapper): string[] {
  return scraper.select("img")
    .map((_, el) => scraper.attr(el, "src"))
    .get()
    .filter((src) => src !== undefined) as string[];
}

const userAgents = [
  // Chrome
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",

  // Firefox
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7; rv:109.0) Gecko/20100101 Firefox/109.0",

  // Edge
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",

  // Mobile
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/537.36",
  "Mozilla/5.0 (Android 13; Mobile; rv:109.0) Gecko/109.0 Firefox/109.0",
  "Mozilla/5.0 (iPad; CPU OS 16_7 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/537.36"
];


export const getRandomUserAgent = (): string => userAgents[Math.random() * userAgents.length | 0];
