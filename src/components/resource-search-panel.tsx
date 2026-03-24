"use client";

import { useMemo, useState } from "react";
import { useEffect } from "react";
import { ResourceCard } from "@/components/resource-card";
import type { CategorySlug, ResourceItem } from "@/types/resource";

type ResourceSearchPanelProps = {
  resources: ResourceItem[];
  tags: string[];
  category?: CategorySlug;
};

export function ResourceSearchPanel({
  resources,
  tags,
  category,
}: ResourceSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>("all");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const raw = window.localStorage.getItem("kh_favorites");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as string[];
        setFavorites(parsed);
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      window.localStorage.setItem("kh_favorites", JSON.stringify(next));
      return next;
    });
  }

  const filteredResources = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return resources.filter((item) => {
      const matchesCategory = category ? item.category === category : true;
      const matchesTag = activeTag === "all" ? true : item.tags.includes(activeTag);
      const matchesKeyword =
        keyword.length === 0
          ? true
          : `${item.title} ${item.description} ${item.tags.join(" ")} ${item.subcategory}`
              .toLowerCase()
              .includes(keyword);

      return matchesCategory && matchesTag && matchesKeyword;
    });
  }, [activeTag, category, query, resources]);

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索标题、简介、标签..."
            className="w-full rounded-xl border border-white/20 bg-zinc-900/60 px-4 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-cyan-300/60"
          />
          <div className="text-sm text-zinc-300">结果: {filteredResources.length}</div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag("all")}
            className={`rounded-full px-3 py-1 text-xs transition ${
              activeTag === "all"
                ? "bg-cyan-400 text-zinc-950"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            全部标签
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`rounded-full px-3 py-1 text-xs transition ${
                activeTag === tag
                  ? "bg-cyan-400 text-zinc-950"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredResources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            isFavorite={favorites.includes(resource.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </section>
  );
}
