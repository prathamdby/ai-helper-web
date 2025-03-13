#!/usr/bin/env node

/**
 * Simple script to verify OpenGraph tags on a deployed site
 * Usage: node verify-og.js https://your-site-url.com
 */

const https = require("https");
const url = process.argv[2] || "https://ai-helper-web.vercel.app";

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
        "og:title": data.match(/<meta property="og:title" content="([^"]+)"/),
        "og:description": data.match(
          /<meta property="og:description" content="([^"]+)"/
        ),
        "og:image": data.match(/<meta property="og:image" content="([^"]+)"/),
        "og:url": data.match(/<meta property="og:url" content="([^"]+)"/),
        "og:type": data.match(/<meta property="og:type" content="([^"]+)"/),
        "og:site_name": data.match(
          /<meta property="og:site_name" content="([^"]+)"/
        ),
        "twitter:card": data.match(
          /<meta name="twitter:card" content="([^"]+)"/
        ),
        "twitter:title": data.match(
          /<meta name="twitter:title" content="([^"]+)"/
        ),
        "twitter:description": data.match(
          /<meta name="twitter:description" content="([^"]+)"/
        ),
        "twitter:image": data.match(
          /<meta name="twitter:image" content="([^"]+)"/
        ),
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
