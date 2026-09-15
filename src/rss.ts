// Import XMLParser to convert RSS XML into a JavaScript object.
import { XMLParser } from "fast-xml-parser";

// Define the structure of an RSS feed
export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

// Define the structure of a single RSS item/post
export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

// Fetch an RSS feed and return it as a structured RSSFeed object
export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  // Fetch the RSS feed from the given URL.
  const response = await fetch(feedURL, {
    headers: {
      "User-Agent": "gator",
    },
  });

  // Read the response body as XML text.
  const xml = await response.text();

  // Create an XML parser and disable XML entity processing for security.
  const parser = new XMLParser({
    processEntities: false,
  });

  // Parse the XML string into a JavaScript object.
  const parsed = parser.parse(xml);

  // Make sure the response contains a valid RSS channel.
  if (!parsed.rss || !parsed.rss.channel) {
    throw new Error("Invalid RSS feed: missing channel");
  }

  // Get the RSS channel from the parsed feed.
  const channel = parsed.rss.channel;

  // Validate the required channel metadata.
  if (
    typeof channel.title !== "string" ||
    typeof channel.link !== "string" ||
    typeof channel.description !== "string"
  ) {
    throw new Error("Invalid RSS feed: missing channel metadata");
  }

  // Get the RSS items, or use an empty array if there are no items
  const rawItems = channel.item ?? [];

  // Make sure items is always an array, even when there is only one item
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];

  // Store only valid RSS items.
  const validItems: RSSItem[] = [];

  // Validate and process each RSS item
  for (const item of items) {
    // Skip items that are missing required fields
    if (
      typeof item.title !== "string" ||
      typeof item.link !== "string" ||
      typeof item.description !== "string" ||
      typeof item.pubDate !== "string"
    ) {
      continue;
    }

    // Add the valid item to the list
    validItems.push({
      title: item.title,
      link: item.link,
      description: item.description,
      pubDate: item.pubDate,
    });
  }

  // Return the parsed and validated RSS feed.
  return {
    channel: {
      title: channel.title,
      link: channel.link,
      description: channel.description,
      item: validItems,
    },
  };
}
