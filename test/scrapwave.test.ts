import { describe, it, expect, beforeAll } from "vitest";
import Scrapper from "../src/scrapper";
import { readFileSync } from "fs";
import path from "path";

let scrapper: Scrapper;

beforeAll(async () => {
  const html = readFileSync(path.join(__dirname, "mock_page.html"), "utf-8");
  scrapper = new Scrapper(html);
});

describe("Scrapper Library Tests", () => {
  it("should extract page title", () => {
    expect(scrapper.getTitle()).toBe("Mock Test Page");
  });

  it("should extract metadata", () => {
    const metadata = scrapper.getMetadata();
    expect(metadata.title).toBe("Mock Test Page");
    expect(metadata.description).toBe("This is a test page for Scrapper library.");
    expect(metadata.author).toBe("John Doe");
  });

  it("should count elements", () => {
    expect(scrapper.count("ul.items li")).toBe(3);
    expect(scrapper.count("table.data-table tr")).toBe(3); // header + 2 rows
  });

  it("should extract table data", () => {
    const table = scrapper.tableData("table.data-table");
    expect(table).toEqual([
      ["Name", "Age"],
      ["Alice", "25"],
      ["Bob", "30"],
    ]);
  });

  it("should extract links", () => {
    const links = scrapper.getLinks("a");
    expect(links).toContain("https://example.com");
  });

  it("should extract image sources", () => {
    const images = scrapper.imageSources("img");
    expect(images).toContain("/images/test.jpg");
  });

  it("should extract forms", () => {
    const forms = scrapper.getForms();
    expect(forms.length).toBe(1);
    expect(forms[0].action).toBe("/submit");
    expect(forms[0].method).toBe("POST");
    expect(forms[0].inputs).toContain("username");
    expect(forms[0].inputs).toContain("password");
  });

  it("should extract emails", () => {
    const emails = scrapper.extractEmails();
    expect(emails).toContain("test@example.com");
  });

  it("should extract phone numbers", () => {
    const phones = scrapper.extractPhones();
    expect(phones).toContain("+123 456 7890");
  });

  it("should extract JSON-LD", () => {
    const jsonLd = scrapper.getJsonLD();
    expect(jsonLd[0]["@type"]).toBe("Person");
    expect(jsonLd[0].name).toBe("John Doe");
  });

  it("should verify element existence", () => {
    expect(scrapper.exists("h1")).toBe(true);
    expect(scrapper.exists(".non-existent-class")).toBe(false);
  });

  it("should extract outer HTML", () => {
    const outerHtml = scrapper.outerHtml("h1");
    expect(outerHtml).toContain("<h1>Welcome to the Test Page</h1>");
  });

  it("should extract text content", () => {
    expect(scrapper.text(".intro")).toBe("This is a simple test page for our Scrapper library.");
  });

  it("should return an empty array for missing elements", () => {
    expect(scrapper.getTextList(".missing-list")).toEqual([]);
  });
});
