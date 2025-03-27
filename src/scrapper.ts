// @ts-ignore
import got from "got";
import * as cheerio from "cheerio";
import { getRandomUserAgent } from "./utils";
import { promises as fs, existsSync } from "node:fs";
import path from "node:path";
import { FormDetails, JsonLD, Metadata, TableData } from "./types";

class Scrapper {
  private readonly $: cheerio.CheerioAPI;

  constructor(html: string) {
    this.$ = cheerio.load(html);
  }

  static async connect(url: string): Promise<Scrapper> {
    const response = await got(url, {
      headers: {
        "User-Agent": getRandomUserAgent()
      }
    });
    return new Scrapper(response.body);
  }

  static async post(url: string, data: Record<string, string>): Promise<Scrapper> {
    const response = await got.post(url, {
      form: data,
      headers: {
        "User-Agent": getRandomUserAgent()
      }
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

  getLinks(selector: string): string[] {
    return this.select(selector)
      .map((_, el) => this.$(el).attr("href"))
      .get()
      .filter((link) => link !== undefined) as string[];
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

  imageSources(selector = "img"): string[] {
    return this.select(selector)
      .map((_, el) => this.$(el).attr("src"))
      .get()
      .filter((src) => src !== undefined) as string[];
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
      twitterImage: this.metaContent("twitter:image"),
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
        const filename = path.join(folder, `image_${index + 1}.jpg`);
        const response = await got(url, { responseType: "buffer" });
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
}

export default Scrapper;
