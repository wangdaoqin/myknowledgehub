import Link from "next/link";
import { ResourceSearchPanel } from "@/components/resource-search-panel";
import {
  CATEGORY_META,
  getAllResources,
  getAllTags,
  getFeaturedResources,
  getLatestResources,
} from "@/lib/resources";

export default async function Home() {
  const allResources = await getAllResources();
  const featuredResources = getFeaturedResources(allResources);
  const latestResources = getLatestResources(allResources, 6);
  const tags = getAllTags(allResources);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#10253d,transparent_45%),#070b12] text-zinc-100">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-10 md:px-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">KnowledgeHub</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">知海导航</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300">
            你的个人知识门户，聚焦编程、统计、AI 与财会。每一条资源都可搜索、可筛选、可持续维护。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {CATEGORY_META.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-300/20"
              >
                {category.icon} {category.name}
              </Link>
            ))}
            <Link
              href="/about"
              className="rounded-xl border border-white/20 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
            >
              关于本站
            </Link>
            <Link
              href="/admin"
              className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-300/20"
            >
              管理后台
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-violet-300/30 bg-violet-300/10 px-4 py-2 text-sm text-violet-200 transition hover:bg-violet-300/20"
            >
              学习看板
            </Link>
            <Link
              href="/updates"
              className="rounded-xl border border-sky-300/30 bg-sky-300/10 px-4 py-2 text-sm text-sky-200 transition hover:bg-sky-300/20"
            >
              RSS更新
            </Link>
            <Link
              href="/friends"
              className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm text-amber-200 transition hover:bg-amber-300/20"
            >
              好友专区
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {CATEGORY_META.map((item) => (
            <Link
              key={item.slug}
              href={`/category/${item.slug}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/40"
            >
              <p className="text-2xl">{item.icon}</p>
              <h2 className="mt-3 text-lg font-semibold text-white">{item.name}</h2>
              <p className="mt-2 text-sm text-zinc-300">{item.shortDescription}</p>
            </Link>
          ))}
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-semibold">全局搜索与标签筛选</h2>
            <p className="text-sm text-zinc-400">总资源数: {allResources.length}</p>
          </div>
          <ResourceSearchPanel resources={allResources} tags={tags} />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-white">今日推荐</h3>
            <div className="mt-4 space-y-3">
              {featuredResources.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl border border-white/10 bg-zinc-900/40 px-4 py-3 transition hover:border-cyan-300/40"
                >
                  <p className="text-sm font-medium text-zinc-100">{item.title}</p>
                  <p className="text-xs text-zinc-400">{item.description}</p>
                </a>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-white">最近更新</h3>
            <div className="mt-4 space-y-3">
              {latestResources.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/10 bg-zinc-900/40 px-4 py-3"
                >
                  <p className="text-sm font-medium text-zinc-100">{item.title}</p>
                  <p className="text-xs text-zinc-400">验证时间: {item.lastVerifiedAt}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-zinc-300">
          <p>由你维护的个人学习指挥中心，支持每日增量更新。</p>
          <p className="mt-1">
            建议下一步: 连接 GitHub + Vercel 自动部署，并持续补充每个分类 20-30 条资源。
          </p>
          <p className="mt-1">
            可选扩展: 好友登录、收藏夹、RSS 自动抓取、学习进度追踪看板。
          </p>
        </footer>
      </main>
    </div>
  );
}
