import type { Metadata } from "next/types";

export const baseUrl = "https://luats.lol";
const title = "LuaTS | Docs";

export function createMetadata(override: Metadata): Metadata {
  // Handle the override images
  const images = override.openGraph?.images;
  const defaultImage = "/banner.png";

  let imageUrl = defaultImage;
  if (images) {
    if (typeof images === "string") {
      imageUrl = images;
    } else if (Array.isArray(images) && images.length > 0) {
      imageUrl = typeof images[0] === "string" ? images[0] : defaultImage;
    }
  }

  // Ensure absolute URL
  const absoluteImageUrl = imageUrl.startsWith("http")
    ? imageUrl
    : `${baseUrl}${imageUrl}`;

  return {
    ...override,
    openGraph: {
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      url: baseUrl,
      images: {
        url: absoluteImageUrl,
        width: 1200,
        height: 630,
      },
      siteName: title,
      ...override.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      creator: "@ranveersoni98",
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      images: {
        url: absoluteImageUrl,
        width: 1200,
        height: 630,
      },
      ...override.twitter,
    },
  };
}
