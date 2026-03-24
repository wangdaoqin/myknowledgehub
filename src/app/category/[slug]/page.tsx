import Link from "next/link";
import { notFound } from "next/navigation";
import { ResourceSearchPanel } from "@/components/resource-search-panel";
import {
  CATEGORY_META,
  getAllResources,
  getAllTags,
  getResourcesByCategory,
} from "@/lib/resources";
import type { CategorySlug } from "@/types/resource";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

const VALID_CATEGORIES = new Set<CategorySlug>([
  "programming",
  "statistics",
  "ai",
  "accounting",
]);

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  if (!VALID_CATEGORIES.has(slug as CategorySlug)) {
    notFound();
  }

  const category = slug as CategorySlug;
  const categoryMeta = CATEGORY_META.find((item) => item.slug === category);
  if (!categoryMeta) {
    notFound();
  }

  const allResources = await getAllResources();
  const resources = getResourcesByCategory(allResources, category);
  const tags = getAllTags(allResources).filter((tag) =>
    allResources.some((item) => item.category === category && item.tags.includes(tag)),
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#10253d,transparent_45%),#070b12] text-zinc-100">
      <main className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8">
        <header className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <Link href="/" className="text-sm text-cyan-300 hover:text-cyan-200">
            ← 返回首页
          </Link>
          <h1 className="mt-3 text-3xl font-bold">
            {categoryMeta.icon} {categoryMeta.name}
          </h1>
          <p className="mt-2 text-sm text-zinc-300">{categoryMeta.shortDescription}</p>
        </header>

        <ResourceSearchPanel resources={resources} tags={tags} category={category} />
      </main>
    </div>
  );
}
