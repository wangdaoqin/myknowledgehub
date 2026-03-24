import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#10253d,transparent_45%),#070b12] text-zinc-100">
      <main className="mx-auto w-full max-w-4xl px-5 py-10 md:px-8">
        <Link href="/" className="text-sm text-cyan-300 hover:text-cyan-200">
          ← 返回首页
        </Link>
        <section className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-3xl font-bold">关于知海导航</h1>
          <p className="mt-4 text-sm leading-7 text-zinc-300">
            这是一个个人知识门户项目，目标是把零散学习链接升级为结构化知识入口。网站覆盖编程语言、统计分析、AI 工具、会计与财税四大板块，并通过标签和搜索实现跨领域检索。
          </p>
          <p className="mt-3 text-sm leading-7 text-zinc-300">
            你可以按日常学习节奏持续更新资源，每条链接都保留简介、标签、推荐指数和验证时间，逐步积累成可复用、可分享的知识资产。
          </p>
          <div className="mt-5 rounded-xl border border-white/10 bg-zinc-900/40 p-4 text-sm text-zinc-300">
            当前版本特性: 全局搜索、标签筛选、分类导航、推荐与最近更新面板、JSON 数据管理、CSV/JSON 批量导入导出脚本。
          </div>
        </section>
      </main>
    </div>
  );
}
