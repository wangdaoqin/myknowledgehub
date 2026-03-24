import Link from "next/link";
import { fetchFeeds } from "@/lib/rss";

export const dynamic = "force-dynamic";

export default async function UpdatesPage() {
  const items = await fetchFeeds(24);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#10253d,transparent_45%),#070b12] text-zinc-100">
      <main className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8">
        <header className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <Link href="/" className="text-sm text-cyan-300 hover:text-cyan-200">
            ← 返回首页
          </Link>
          <h1 className="mt-3 text-3xl font-bold">RSS 更新聚合</h1>
          <p className="mt-2 text-sm text-zinc-300">
            自动汇总你关注的技术和 AI 资讯源，按发布时间排序。
          </p>
        </header>

        <section className="grid gap-3 md:grid-cols-2">
          {items.map((item, idx) => (
            <a
              key={`${item.link}-${idx}`}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-cyan-300/40"
            >
              <p className="text-sm text-cyan-300">{item.source}</p>
              <h3 className="mt-1 font-medium text-zinc-100">{item.title}</h3>
              <p className="mt-2 text-xs text-zinc-400">
                {new Date(item.pubDate).toLocaleString()} · {item.category}
              </p>
            </a>
          ))}
        </section>
      </main>
    </div>
  );
}
