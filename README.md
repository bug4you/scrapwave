# ScrapWave - Lightweight Web Scraping Library

ScrapWave is a lightweight and powerful web scraping library built on top of `got` and `cheerio`. It allows you to fetch, parse, and extract data from web pages with ease.

[![CodeQL Advanced](https://github.com/bug4you/scrapwave/actions/workflows/codeql.yml/badge.svg)](https://github.com/bug4you/scrapwave/actions/workflows/codeql.yml)
[![Run Scrapper Tests](https://github.com/bug4you/scrapwave/actions/workflows/test.yml/badge.svg)](https://github.com/bug4you/scrapwave/actions/workflows/test.yml)
![npm](https://img.shields.io/npm/v/scrapwave)
![npm](https://img.shields.io/npm/dm/scrapwave)
![GitHub](https://img.shields.io/github/license/bug4you/scrapwave)




## 🚀 Installation

```sh
npm install scrapwave
```

or using Yarn:

```sh
yarn add scrapwave
```

## 📖 Quick Start

```ts
import ScrapWave from "scrapwave";

(async () => {
  const scrapper = await ScrapWave.connect("https://example.com");
  console.log(scrapper.getTitle());
})();
```

## 🎯 Features

- Fetch and parse web pages with ease.
- Extract metadata, links, images, emails, and phone numbers.
- Scrape table data and structured JSON-LD content.
- Supports POST requests with form data.
- Configurable request options (timeout, retries, headers, etc.).
- Download images automatically.

## 📌 API Methods

### `ScrapWave.connect(url: string): Promise<ScrapWave>`
Fetches the HTML content of the given URL and returns a ScrapWave instance.

### `ScrapWave.post(url: string, data: Record<string, string>): Promise<ScrapWave>`
Sends a POST request with form data and returns a ScrapWave instance.

### `scrapper.getTitle(): string`
Returns the title of the page.

### `scrapper.getMetadata(): Metadata`
Extracts metadata (title, description, author, Open Graph & Twitter metadata).

### `scrapper.getLinks(selector: string): string[]`
Extracts all links from the given selector.

### `scrapper.imageSources(selector = "img"): string[]`
Extracts image URLs from the page.

### `scrapper.extractEmails(): string[]`
Finds and returns email addresses from the page content.

### `scrapper.extractPhones(): string[]`
Finds and returns phone numbers from the page content.

### `scrapper.getJsonLD(): JsonLD`
Extracts JSON-LD structured data from the page.

### `scrapper.getForms(): FormDetails[]`
Finds and extracts form details (action, method, input fields).

### `scrapper.getTextList(selector: string): string[]`
Extracts a list of text content from elements like `<li>`.

### `scrapper.outerHtml(selector: string): string`
Extracts the outer HTML of the given selector.

### `scrapper.tableData(selector: string): TableData`
Extracts table data from the given selector.

### `scrapper.text(selector: string): string`
Extracts the text content of the given selector.

### `scrapper.html(selector: string): string`
Extracts the inner HTML of the given selector.

### `scrapper.attr(selector: string, attribute: string): string | undefined`
Retrieves the value of a specific attribute from the given selector.

### `scrapper.exists(selector: string): boolean`
Checks whether a specific selector exists on the page.

### `scrapper.count(selector: string): number`
Counts the number of elements that match the given selector.

### `scrapper.downloadImages(folder = "images"): Promise<void>`
Downloads all images from the page into the specified folder.

### `scrapper.setRequestOptions(options: RequestOptions): void`
Allows customizing request settings such as timeout, retries, headers, etc.

## ⚙️ Customizing Request Options

```ts
ScrapWave.setRequestOptions({
  timeout: { request: 4000 }, // Set timeout to 4s
  retry: { limit: 3 }, // Allow up to 3 retries
});
```

## 🛠️ Usage Examples

### Extracting Links
```ts
const scrapper = await ScrapWave.connect("https://example.com");
console.log(scrapper.getLinks("a"));
```

### Scraping Table Data
```ts
const scrapper = await ScrapWave.connect("https://example.com");
console.log(scrapper.tableData("table"));
```

### Downloading Images
```ts
const scrapper = await ScrapWave.connect("https://example.com");
await scrapper.downloadImages("downloads");
```

### Extracting Emails & Phone Numbers
```ts
const scrapper = await ScrapWave.connect("https://example.com");
console.log("Emails:", scrapper.extractEmails());
console.log("Phones:", scrapper.extractPhones());
```

### Extracting Text & HTML
```ts
const scrapper = await ScrapWave.connect("https://example.com");
console.log("Text:", scrapper.text("p"));
console.log("HTML:", scrapper.html("div"));
console.log("Outer HTML:", scrapper.outerHtml("div"));
```

### Extracting Metadata
```ts
const scrapper = await ScrapWave.connect("https://example.com");
console.log(scrapper.getMetadata());
```

### Extracting List Items
```ts
const scrapper = await ScrapWave.connect("https://example.com");
console.log(scrapper.getTextList("ul"));
```

### Checking for Element Existence & Counting Elements
```ts
const scrapper = await ScrapWave.connect("https://example.com");
console.log("Exists:", scrapper.exists("h1"));
console.log("Count:", scrapper.count("li"));
```

## 📌 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## 📜 License

MIT License. Feel free to use and modify as needed.
