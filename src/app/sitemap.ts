import type { MetadataRoute } from "next";
import { serverApi } from "@/lib/api/server";
import { siteConfig } from "@/lib/site";
import type { PublicProperty } from "@/types/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ["", "/properties", "/services", "/about", "/faq", "/contact", "/login", "/register"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const listings = await serverApi
    .list<PublicProperty>("/properties", { query: { limit: 100 }, revalidate: 3600 })
    .then(({ data }) => data.map((p) => ({ url: `${siteConfig.url}/properties/${p.id}`, lastModified: p.updatedAt, priority: 0.8 })))
    .catch(() => []);

  return [...staticPages, ...listings];
}
