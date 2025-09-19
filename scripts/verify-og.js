#!/usr/bin/env node

/**
 * Simple script to verify OpenGraph tags on a deployed site
 * Usage: node verify-og.js https://your-site-url.com
 */

const https = require("https");
const url = process.argv[2] || "https://ai-helper-web.vercel.app";

// Regex patterns for meta tag extraction
const OG_TITLE_PATTERN = /<meta property="og:title" content="([^"]+)"/;
const OG_DESCRIPTION_PATTERN =
  /<meta property="og:description" content="([^"]+)"/;
const OG_IMAGE_PATTERN = /<meta property="og:image" content="([^"]+)"/;
const OG_URL_PATTERN = /<meta property="og:url" content="([^"]+)"/;
const OG_TYPE_PATTERN = /<meta property="og:type" content="([^"]+)"/;
const OG_SITE_NAME_PATTERN = /<meta property="og:site_name" content="([^"]+)"/;
const TWITTER_CARD_PATTERN = /<meta name="twitter:card" content="([^"]+)"/;
const TWITTER_TITLE_PATTERN = /<meta name="twitter:title" content="([^"]+)"/;
const TWITTER_DESCRIPTION_PATTERN =
  /<meta name="twitter:description" content="([^"]+)"/;
const TWITTER_IMAGE_PATTERN = /<meta name="twitter:image" content="([^"]+)"/;

if (!url) {
  console.error("Please provide a URL to check");
  process.exit(1);
}

console.log(`Checking OpenGraph tags for: ${url}`);

https
  .get(url, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      // Check for OpenGraph tags
      const ogTags = {
        "og:title": data.match(OG_TITLE_PATTERN),
        "og:description": data.match(OG_DESCRIPTION_PATTERN),
        "og:image": data.match(OG_IMAGE_PATTERN),
        "og:url": data.match(OG_URL_PATTERN),
        "og:type": data.match(OG_TYPE_PATTERN),
        "og:site_name": data.match(OG_SITE_NAME_PATTERN),
        "twitter:card": data.match(TWITTER_CARD_PATTERN),
        "twitter:title": data.match(TWITTER_TITLE_PATTERN),
        "twitter:description": data.match(TWITTER_DESCRIPTION_PATTERN),
        "twitter:image": data.match(TWITTER_IMAGE_PATTERN),
      };

      console.log("\nOpenGraph Tags Found:");
      console.log("====================");

      let missingTags = 0;

      for (const [tag, match] of Object.entries(ogTags)) {
        if (match && match[1]) {
          console.log(`✅ ${tag}: ${match[1]}`);
        } else {
          console.log(`❌ ${tag}: Not found`);
          missingTags++;
        }
      }

      console.log("\nSummary:");
      console.log(
        `Found ${Object.keys(ogTags).length - missingTags} of ${Object.keys(ogTags).length} expected OpenGraph tags`
      );

      if (missingTags === 0) {
        console.log("✅ All OpenGraph tags are present!");
      } else {
        console.log(`❌ Missing ${missingTags} OpenGraph tags`);
      }
    });
  })
  .on("error", (err) => {
    console.error(`Error: ${err.message}`);
  });
