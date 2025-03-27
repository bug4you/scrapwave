import {got} from 'got'
import * as cheerio from "cheerio";
import { getRandomUserAgent, isValidUrl, sanitizeInput } from "./utils";
import { promises as fs, existsSync } from "node:fs";
import path from "node:path";
import { FormDetails, JsonLD, Metadata, TableData } from "./types";
import { URL } from "node:url";
import mime from "mime-types";

class Scrapper {
  private readonly $: cheerio.CheerioAPI;
  private static requestOptions = {
    headers: {
      "User-Agent": getRandomUserAgent(),
    },
    timeout: { request: 3000 },
    retry: { limit: 2 },
    followRedirect: true,
  };

  constructor(html: string) {
    this.$ = cheerio.load(html);
  }

  /**
   * Scrapper.setRequestOptions({ timeout: { request: 5000 } });
   * Scrapper.setRequestOptions({ retry: { limit: 5 } });
   * */
  static setRequestOptions(options: Partial<typeof Scrapper.requestOptions>) {
    this.requestOptions = { ...this.requestOptions, ...options };
  }

  static async connect(url: string): Promise<Scrapper> {
    if (!isValidUrl(url)) {
      throw new Error(`Invalid URL: ${url}`);
    }
    const response = await got(url, this.requestOptions);
    return new Scrapper(response.body);
  }

  static async post(url: string, data: Record<string, string>): Promise<Scrapper> {
    if (!isValidUrl(url)) {
      throw new Error(`Invalid URL: ${url}`);
    }
    const safeData = sanitizeInput(data);
    const response = await got.post(url, {
      form: safeData,
      ...this.requestOptions
    });
    return new Scrapper(response.body);
  }

  select(selector: string): cheerio.Cheerio<any> {
    return this.$(selector);
  }

  text(selector: string): string {
    return this.select(selector).text();
  }

  html(selector: string): string {
    return this.$(selector).html() || "";
  }

  attr(selector: string, attribute: string): string | undefined {
    return this.$(selector).attr(attribute);
  }

  count(selector: string): number {
    return this.select(selector).length;
  }

  exists(selector: string): boolean {
    return this.count(selector) > 0;
  }

  outerHtml(selector: string): string {
    return this.select(selector).prop("outerHTML") || "";
  }

  getMetadata(): Metadata {
    return {
      title: this.$("title").text().trim() || undefined,
      description: this.metaContent("description"),
      author: this.metaContent("author"),
      keywords: this.metaContent("keywords"),
      ogTitle: this.metaContent("og:title"),
      ogDescription: this.metaContent("og:description"),
      ogImage: this.metaContent("og:image"),
      twitterTitle: this.metaContent("twitter:title"),
      twitterDescription: this.metaContent("twitter:description"),
      twitterImage: this.metaContent("twitter:image")
    };
  }

  getTitle(): string {
    return this.$("title").text().trim();
  }

  getTextList(selector: string): string[] {
    return this.select(selector)
      .find("li")
      .map((_, el) => this.$(el).text().trim())
      .get();
  }

  getForms(): FormDetails[] {
    return this.select("form").map((_, form) => {
      const inputs = this.$(form)
        .find("input, textarea, select")
        .map((_, el) => this.$(el).attr("name") || this.$(el).attr("id") || "unknown")
        .get();

      return {
        action: this.$(form).attr("action") || "",
        method: this.$(form).attr("method") || "GET",
        inputs
      };
    }).get();
  }

  async downloadImages(folder = "images"): Promise<void> {
    const images = this.imageSources();

    if (!existsSync(folder)) {
      await fs.mkdir(folder, { recursive: true });
    }

    await Promise.all(
      images.map(async (url, index) => {
        if (!isValidUrl(url)) return; // Xavfsiz URL ekanligini tekshiramiz
        const response = await got(url, { responseType: "buffer" });

        const contentType = response.headers["content-type"] || "";
        if (!contentType.startsWith("image/")) return; // Faqat rasm fayllarini yuklash

        const ext = mime.extension(contentType) || "jpg";
        const filename = path.join(folder, `image_${index + 1}.${ext}`);
        await fs.writeFile(filename, response.body);
      })
    );
  }

  extractEmails(): string[] {
    const text = this.$.text();
    return [...new Set(text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [])];
  }

  extractPhones(): string[] {
    const text = this.$.text();
    return [...new Set(text.match(/\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,5}[-.\s]?\d{1,5}[-.\s]?\d{1,9}/g) || [])];
  }

  tableData(selector: string): TableData {
    return this.select(selector)
      .map((_, table) =>
        this.$(table)
          .find("tr")
          .toArray() // Har bir `tr` elementini olish
          .map(row =>
            this.$(row)
              .find("td, th")
              .toArray() // Har bir `td` yoki `th` elementini olish
              .map(cell => this.$(cell).text().trim()) // Har bir hujayraning textini olish
          )
      )
      .get(); // Yakuniy massivni qaytarish
  }

  metaContent(name: string): string {
    return this.$(`meta[name="${name}"], meta[property="${name}"]`).attr("content") || "";
  }

  getJsonLD(): JsonLD {
    return this.select("script[type=\"application/ld+json\"]")
      .map((_, el) => {
        try {
          return JSON.parse(this.$(el).html() || "{}");
        } catch {
          return null;
        }
      })
      .get()
      .filter((data) => data !== null);
  }

  // import { URL } from "node:url";

  toAbsoluteUrl(relativeUrl: string, baseUrl: string): string {
    try {
      return new URL(relativeUrl, baseUrl).href;
    } catch {
      return relativeUrl;
    }
  }

  getLinks(selector: string): string[] {
    return this.select(selector)
      .map((_, el) => this.toAbsoluteUrl(this.$(el).attr("href") || "", this.$("base").attr("href") || ""))
      .get()
      .filter((link) => link !== undefined);
  }

  imageSources(selector = "img"): string[] {
    return this.select(selector)
      .map((_, el) => this.toAbsoluteUrl(this.$(el).attr("src") || "", this.$("base").attr("href") || ""))
      .get()
      .filter((src) => src !== undefined);
  }
}

export default Scrapper;
