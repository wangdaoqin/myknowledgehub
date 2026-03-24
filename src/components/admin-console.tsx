"use client";

import { useEffect, useMemo, useState } from "react";
import type { ResourceItem } from "@/types/resource";

const emptyForm: Omit<ResourceItem, "id"> & { id: string; tagsText: string } = {
  id: "",
  title: "",
  url: "",
  description: "",
  category: "programming",
  subcategory: "general",
  stage: "beginner",
  scenario: "general",
  tags: [],
  tagsText: "",
  icon: "/globe.svg",
  rating: "★★★☆☆",
  recommendedScore: 3,
  lastVerifiedAt: new Date().toISOString().slice(0, 10),
  isFeatured: false,
};

export function AdminConsole() {
  const [token, setToken] = useState("");
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("请先输入管理员令牌并加载数据。");
  const [logs, setLogs] = useState<
    Array<{
      id: number;
      action: string;
      resourceId: string;
      detail: string;
      createdAt: string;
    }>
  >([]);
  const [logPage, setLogPage] = useState(1);
  const [logPageSize, setLogPageSize] = useState(20);
  const [logAction, setLogAction] = useState("all");
  const [logQuery, setLogQuery] = useState("");
  const [logTotalPages, setLogTotalPages] = useState(1);

  useEffect(() => {
    const saved = window.localStorage.getItem("kh_admin_token");
    if (saved) setToken(saved);
  }, []);

  async function api<T>(method: string, url: string, body?: unknown): Promise<T> {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || "request failed");
    }
    return json as T;
  }

  async function load(logPageOverride?: number) {
    const nextPage = logPageOverride ?? logPage;
    try {
      const json = await api<{ items: ResourceItem[] }>("GET", "/api/admin/resources");
      const auditJson = await api<{
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
        items: Array<{
          id: number;
          action: string;
          resourceId: string;
          detail: string;
          createdAt: string;
        }>;
      }>(
        "GET",
        `/api/admin/audit?page=${nextPage}&pageSize=${logPageSize}&action=${encodeURIComponent(logAction)}&q=${encodeURIComponent(logQuery)}`,
      );
      setResources(json.items);
      setLogs(auditJson.items);
      setLogTotalPages(auditJson.totalPages);
      setLogPage(auditJson.page);
      setStatus(`加载成功，当前 ${json.items.length} 条资源。`);
      window.localStorage.setItem("kh_admin_token", token);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "加载失败");
    }
  }

  const selected = useMemo(
    () => resources.find((item) => item.id === selectedId),
    [resources, selectedId],
  );

  function fillFormFromSelected() {
    if (!selected) return;
    setForm({
      ...selected,
      tagsText: selected.tags.join(", "),
    });
  }

  async function createResource() {
    try {
      await api("POST", "/api/admin/resources", {
        ...form,
        tags: form.tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setStatus("新增成功");
      await load();
      setForm(emptyForm);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "新增失败");
    }
  }

  async function updateResource() {
    try {
      await api("PUT", "/api/admin/resources", {
        ...form,
        tags: form.tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setStatus("更新成功");
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "更新失败");
    }
  }

  async function deleteResource() {
    if (!form.id) return;
    try {
      await api("DELETE", `/api/admin/resources?id=${encodeURIComponent(form.id)}`);
      setStatus("删除成功");
      await load();
      setForm(emptyForm);
      setSelectedId("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "删除失败");
    }
  }

  function exportAuditCsv() {
    const url = `/api/admin/audit?page=${logPage}&pageSize=${logPageSize}&action=${encodeURIComponent(
      logAction,
    )}&q=${encodeURIComponent(logQuery)}&format=csv`;
    fetch(url, {
      headers: { "x-admin-token": token },
    })
      .then(async (response) => {
        if (!response.ok) {
          const json = await response.json();
          throw new Error(json.message || "导出失败");
        }
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = "admin-audit-log.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(objectUrl);
      })
      .catch((error) => {
        setStatus(error instanceof Error ? error.message : "导出失败");
      });
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-semibold">管理员认证</h2>
        <p className="mt-1 text-sm text-zinc-400">环境变量 `ADMIN_TOKEN` 与这里输入一致即可管理。</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="输入管理员令牌"
            className="w-full max-w-xl rounded-lg border border-white/20 bg-zinc-900/60 px-3 py-2 text-sm"
          />
          <button
            onClick={() => load()}
            className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-medium text-zinc-950"
          >
            加载资源
          </button>
        </div>
        <p className="mt-2 text-xs text-zinc-400">{status}</p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="font-semibold">资源列表</h3>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="mt-3 w-full rounded-lg border border-white/20 bg-zinc-900/60 px-2 py-2 text-sm"
          >
            <option value="">选择要编辑的资源</option>
            {resources.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} ({item.id})
              </option>
            ))}
          </select>
          <button
            onClick={fillFormFromSelected}
            disabled={!selectedId}
            className="mt-2 rounded-lg border border-white/20 px-3 py-2 text-sm disabled:opacity-50"
          >
            填充到表单
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="font-semibold">资源编辑表单</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {[
              ["id", "ID"],
              ["title", "标题"],
              ["url", "链接"],
              ["subcategory", "子分类"],
              ["scenario", "应用场景"],
              ["icon", "图标 URL"],
              ["rating", "推荐指数(星级字符)"],
              ["lastVerifiedAt", "验证日期 YYYY-MM-DD"],
            ].map(([key, label]) => (
              <label key={key} className="text-sm">
                <span className="mb-1 block text-zinc-400">{label}</span>
                <input
                  value={form[key as keyof typeof form] as string}
                  onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))}
                  className="w-full rounded-lg border border-white/20 bg-zinc-900/60 px-3 py-2"
                />
              </label>
            ))}
            <label className="text-sm">
              <span className="mb-1 block text-zinc-400">分类</span>
              <select
                value={form.category}
                onChange={(e) => setForm((s) => ({ ...s, category: e.target.value as ResourceItem["category"] }))}
                className="w-full rounded-lg border border-white/20 bg-zinc-900/60 px-3 py-2"
              >
                <option value="programming">programming</option>
                <option value="statistics">statistics</option>
                <option value="ai">ai</option>
                <option value="accounting">accounting</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-zinc-400">学习阶段</span>
              <select
                value={form.stage}
                onChange={(e) => setForm((s) => ({ ...s, stage: e.target.value as ResourceItem["stage"] }))}
                className="w-full rounded-lg border border-white/20 bg-zinc-900/60 px-3 py-2"
              >
                <option value="beginner">beginner</option>
                <option value="intermediate">intermediate</option>
                <option value="advanced">advanced</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-zinc-400">推荐分值 (1-5)</span>
              <input
                type="number"
                min={1}
                max={5}
                value={form.recommendedScore}
                onChange={(e) =>
                  setForm((s) => ({ ...s, recommendedScore: Number(e.target.value || 3) }))
                }
                className="w-full rounded-lg border border-white/20 bg-zinc-900/60 px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-zinc-400">标签 (逗号分隔)</span>
              <input
                value={form.tagsText}
                onChange={(e) => setForm((s) => ({ ...s, tagsText: e.target.value }))}
                className="w-full rounded-lg border border-white/20 bg-zinc-900/60 px-3 py-2"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((s) => ({ ...s, isFeatured: e.target.checked }))}
              />
              今日推荐
            </label>
          </div>
          <label className="mt-3 block text-sm">
            <span className="mb-1 block text-zinc-400">一句话简介</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              className="w-full rounded-lg border border-white/20 bg-zinc-900/60 px-3 py-2"
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={createResource}
              className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-medium text-zinc-950"
            >
              新增
            </button>
            <button
              onClick={updateResource}
              className="rounded-lg border border-white/30 px-4 py-2 text-sm"
            >
              更新
            </button>
            <button
              onClick={deleteResource}
              className="rounded-lg border border-rose-400/60 px-4 py-2 text-sm text-rose-300"
            >
              删除
            </button>
          </div>
        </div>
      </section>
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">操作审计日志</h3>
          <button
            onClick={exportAuditCsv}
            className="rounded-lg border border-cyan-300/40 px-3 py-1 text-xs text-cyan-200"
          >
            导出当前页 CSV
          </button>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <select
            value={logAction}
            onChange={(e) => setLogAction(e.target.value)}
            className="rounded-lg border border-white/20 bg-zinc-900/60 px-2 py-2 text-sm"
          >
            <option value="all">全部动作</option>
            <option value="create">create</option>
            <option value="update">update</option>
            <option value="delete">delete</option>
          </select>
          <input
            value={logQuery}
            onChange={(e) => setLogQuery(e.target.value)}
            placeholder="搜索 resourceId/detail"
            className="rounded-lg border border-white/20 bg-zinc-900/60 px-2 py-2 text-sm"
          />
          <select
            value={logPageSize}
            onChange={(e) => setLogPageSize(Number(e.target.value))}
            className="rounded-lg border border-white/20 bg-zinc-900/60 px-2 py-2 text-sm"
          >
            <option value={10}>10/页</option>
            <option value={20}>20/页</option>
            <option value={50}>50/页</option>
          </select>
          <button
            onClick={() => load(1)}
            className="rounded-lg border border-white/30 px-3 py-2 text-sm"
          >
            应用筛选
          </button>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          {logs.map((log) => (
            <div key={log.id} className="rounded-lg border border-white/10 bg-zinc-900/40 px-3 py-2">
              <p className="text-zinc-100">
                [{log.action}] {log.resourceId}
              </p>
              <p className="text-xs text-zinc-400">{log.detail}</p>
              <p className="text-xs text-zinc-500">{new Date(log.createdAt).toLocaleString()}</p>
            </div>
          ))}
          {logs.length === 0 ? <p className="text-xs text-zinc-400">暂无日志</p> : null}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <button
            onClick={() => load(Math.max(1, logPage - 1))}
            disabled={logPage <= 1}
            className="rounded border border-white/30 px-2 py-1 disabled:opacity-50"
          >
            上一页
          </button>
          <span className="text-zinc-400">
            第 {logPage} / {logTotalPages} 页
          </span>
          <button
            onClick={() => load(Math.min(logTotalPages, logPage + 1))}
            disabled={logPage >= logTotalPages}
            className="rounded border border-white/30 px-2 py-1 disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      </section>
    </div>
  );
}
