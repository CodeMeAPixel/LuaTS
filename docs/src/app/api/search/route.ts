import { createSearchAPI } from "fumadocs-core/search/server";
import { source } from "@/lib/source";

export const { GET } = createSearchAPI("advanced", {
  indexes: await Promise.all(
    source.getPages().map(async (page) => {
      try {
        const data = await page.data.load();
        return {
          title: page.data.title,
          description: page.data.description,
          url: page.url,
          id: page.url,
          structuredData: {
            headings: data.structuredData?.headings || [],
            contents: data.structuredData?.contents || [],
          },
        };
      } catch (error) {
        console.error(`Error loading page ${page.url}:`, error);
        // Return a minimal index entry if we can't load the full page
        return {
          title: page.data.title || "Untitled",
          description: page.data.description || "",
          url: page.url,
          id: page.url,
          structuredData: {
            headings: [],
            contents: [],
          },
        };
      }
    }),
  ),
});
