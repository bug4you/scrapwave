import ScrapWave from "../src/scrapper";

describe("ScrapWave", () => {
  let scrapper: ScrapWave;

  beforeAll(async () => {
    scrapper = await ScrapWave.connect("https://example.com");
  });

  test("should fetch page title", () => {
    expect(scrapper.getTitle()).toBeTruthy();
  });

  test("should extract metadata", () => {
    const metadata = scrapper.getMetadata();
    expect(metadata.title).toBeDefined();
    expect(metadata.description).toBeDefined();
  });

  test("should extract links", () => {
    const links = scrapper.getLinks("a");
    expect(Array.isArray(links)).toBe(true);
  });

  test("should extract text content", () => {
    const text = scrapper.text("p");
    expect(typeof text).toBe("string");
  });

  test("should check element existence", () => {
    expect(scrapper.exists("h1")).toBe(true);
  });

  test("should count elements", () => {
    expect(scrapper.count("li")).toBeGreaterThanOrEqual(0);
  });
});
