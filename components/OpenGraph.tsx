import type { Metadata } from "next";

type OpenGraphProps = {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
};

/**
 * Generates OpenGraph metadata for dynamic pages
 *
 * @param props OpenGraph properties
 * @returns Metadata object with OpenGraph and Twitter card properties
 */
export function generateOpenGraph({
  title = "AI Helper - Real-time Question Analysis",
  description = "Analyze questions in real-time using computer vision and multiple AI models",
  url = "https://ai-helper-web.vercel.app",
  image = "/images/og-image.jpg",
}: OpenGraphProps = {}): Metadata {
  const ogTitle = title;
  const ogDescription = description;
  const ogUrl = url;
  const ogImage = image;

  return {
    title: ogTitle,
    description: ogDescription,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: ogUrl,
      title: ogTitle,
      description: ogDescription,
      siteName: "AI Helper",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
      creator: "@prathamdby",
    },
  };
}
