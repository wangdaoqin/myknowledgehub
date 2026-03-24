import Link from "next/link";
import { AdminConsole } from "@/components/admin-console";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#10253d,transparent_45%),#070b12] text-zinc-100">
      <main className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8">
        <header className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <Link href="/" className="text-sm text-cyan-300 hover:text-cyan-200">
            ← 返回首页
          </Link>
          <h1 className="mt-3 text-3xl font-bold">后台管理台</h1>
          <p className="mt-2 text-sm text-zinc-300">
            用于每日新增、修改、删除资源。所有写操作都会落盘到 `data/resources.json`。
          </p>
        </header>
        <AdminConsole />
      </main>
    </div>
  );
}
