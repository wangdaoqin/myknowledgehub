"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FriendLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("请输入好友访问码");

  async function submit() {
    setMsg("验证中...");
    const response = await fetch("/api/friend-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const json = await response.json();
    if (!response.ok) {
      setMsg(json.message || "验证失败");
      return;
    }
    setMsg("验证成功，正在跳转...");
    router.push("/friends");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#10253d,transparent_45%),#070b12] text-zinc-100">
      <main className="mx-auto w-full max-w-lg px-5 py-20">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-2xl font-bold">好友访问</h1>
          <p className="mt-2 text-sm text-zinc-400">输入访问码后可查看好友专属页面。</p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Access Code"
            className="mt-4 w-full rounded-lg border border-white/20 bg-zinc-900/60 px-3 py-2"
          />
          <button
            onClick={submit}
            className="mt-3 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-medium text-zinc-950"
          >
            登录
          </button>
          <p className="mt-3 text-xs text-zinc-400">{msg}</p>
        </section>
      </main>
    </div>
  );
}
