import type { CategoryMeta, CategorySlug, ResourceItem } from "@/types/resource";
import { readResourcesFromFile } from "@/lib/resource-store";
import { prisma } from "@/lib/prisma";

export const CATEGORY_META: CategoryMeta[] = [
  {
    slug: "programming",
    name: "编程语言",
    shortDescription: "Python / R / JavaScript 多维学习路径",
    icon: "💻",
  },
  {
    slug: "statistics",
    name: "统计分析",
    shortDescription: "理论统计与应用统计双轨并行",
    icon: "📊",
  },
  {
    slug: "ai",
    name: "AI 工具教程",
    shortDescription: "AI 编程助手与大模型应用实践",
    icon: "🤖",
  },
  {
    slug: "accounting",
    name: "会计知识教程",
    shortDescription: "认证备考、税法更新与财经资讯",
    icon: "📒",
  },
];

function mapDbItem(item: {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  subcategory: string;
  stage: string;
  scenario: string;
  tags: string;
  icon: string;
  rating: string;
  recommendedScore: number;
  lastVerifiedAt: string;
  isFeatured: boolean;
}): ResourceItem {
  return {
    ...item,
    category: item.category as CategorySlug,
    stage: item.stage as ResourceItem["stage"],
    tags: item.tags ? item.tags.split("|").filter(Boolean) : [],
  };
}

export function getCategoryMeta(slug: CategorySlug) {
  return CATEGORY_META.find((item) => item.slug === slug);
}

export async function getAllResources(): Promise<ResourceItem[]> {
  try {
    const rows = await prisma.resource.findMany();
    if (rows.length > 0) {
      return rows.map(mapDbItem);
    }
  } catch {
    // fallback to JSON when database is unavailable
  }
  return readResourcesFromFile();
}

export function getResourcesByCategory(resources: ResourceItem[], slug: CategorySlug) {
  return resources
    .filter((item) => item.category === slug)
    .sort((a, b) => b.lastVerifiedAt.localeCompare(a.lastVerifiedAt));
}

export function getFeaturedResources(resources: ResourceItem[]) {
  return resources
    .filter((item) => item.isFeatured)
    .sort((a, b) => b.lastVerifiedAt.localeCompare(a.lastVerifiedAt))
    .slice(0, 8);
}

export function getLatestResources(resources: ResourceItem[], limit = 8) {
  return [...resources]
    .sort((a, b) => b.lastVerifiedAt.localeCompare(a.lastVerifiedAt))
    .slice(0, limit);
}

export function getAllTags(resources: ResourceItem[]) {
  return [...new Set(resources.flatMap((item) => item.tags))].sort((a, b) =>
    a.localeCompare(b),
  );
}
