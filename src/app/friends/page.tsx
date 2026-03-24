import Link from "next/link";

export default function FriendsPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#10253d,transparent_45%),#070b12] text-zinc-100">
      <main className="mx-auto w-full max-w-4xl px-5 py-10 md:px-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <Link href="/" className="text-sm text-cyan-300 hover:text-cyan-200">
            ← 返回首页
          </Link>
          <h1 className="mt-3 text-3xl font-bold">好友专区</h1>
          <p className="mt-2 text-sm text-zinc-300">
            你已通过访问验证。这里可继续扩展为私密笔记、精选清单或小组学习空间。
          </p>
        </header>
      </main>
    </div>
  );
}
