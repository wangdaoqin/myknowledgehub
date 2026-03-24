import Link from "next/link";
import { CATEGORY_META, getAllResources } from "@/lib/resources";

export default async function DashboardPage() {
  const allResources = await getAllResources();
  const byCategory = CATEGORY_META.map((category) => ({
    ...category,
    count: allResources.filter((item) => item.category === category.slug).length,
  }));

  const topTags = Object.entries(
    allResources
      .flatMap((item) => item.tags)
      .reduce<Record<string, number>>((acc, tag) => {
        acc[tag] = (acc[tag] ?? 0) + 1;
        return acc;
      }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#10253d,transparent_45%),#070b12] text-zinc-100">
      <main className="mx-auto w-full max-w-6xl px-5 py-10 md:px-8">
        <header className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <Link href="/" className="text-sm text-cyan-300 hover:text-cyan-200">
            ← 返回首页
          </Link>
          <h1 className="mt-3 text-3xl font-bold">学习看板</h1>
          <p className="mt-2 text-sm text-zinc-300">按板块和标签查看知识库结构，追踪资源积累进度。</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {byCategory.map((item) => (
            <div key={item.slug} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-2xl">{item.icon}</p>
              <p className="mt-2 text-sm text-zinc-300">{item.name}</p>
              <p className="mt-1 text-3xl font-bold text-cyan-300">{item.count}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold">高频标签 TOP 12</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <span
                key={tag}
                className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-200"
              >
                #{tag} ({count})
              </span>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
