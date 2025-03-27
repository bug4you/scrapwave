// Scraper uchun umumiy interfeyslar

/** Meta ma'lumotlar uchun interfeys */
export interface Metadata {
  title?: string;
  description?: string;
  author?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

export interface FormDetails {
  action?: string;
  method?: string;
  inputs?: string[];
}

/** Jadval ma'lumotlari */
export type TableData = string[][];

/** URL turi */
export type UrlType = string;

/** HTTP so'rov turi */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

/** Sahifadagi rasm ma'lumotlari */
export interface ImageData {
  src: string;
  alt?: string;
}

/** JSON-LD formatidagi ma'lumotlar */
export type JsonLD = any;

/** Telefon va email ma'lumotlari */
export interface ContactInfo {
  emails: string[];
  phones: string[];
}
