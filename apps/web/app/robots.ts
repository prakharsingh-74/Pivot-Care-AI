import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/conversations/",
        "/customization/",
        "/billing/",
        "/files/",
        "/integrations/",
        "/plugins/",
      ],
    },
    sitemap: "https://pivot-care-ai-web.vercel.app/sitemap.xml",
  };
}
