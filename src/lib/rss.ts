import Parser from "rss-parser";
import sources from "../../data/rss-sources.json";

type RssSource = {
  id: string;
  name: string;
  url: string;
  category: string;
};

export type FeedItem = {
  source: string;
  title: string;
  link: string;
  pubDate: string;
  category: string;
};

const parser = new Parser();

export async function fetchFeeds(limit = 18): Promise<FeedItem[]> {
  const feeds = await Promise.all(
    (sources as RssSource[]).map(async (source) => {
      try {
        const feed = await parser.parseURL(source.url);
        return (feed.items ?? []).slice(0, 8).map((item) => ({
          source: source.name,
          title: item.title ?? "(untitled)",
          link: item.link ?? source.url,
          pubDate: item.pubDate ?? new Date().toISOString(),
          category: source.category,
        }));
      } catch {
        return [];
      }
    }),
  );

  return feeds
    .flat()
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, limit);
}
