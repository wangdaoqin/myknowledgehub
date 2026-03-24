export type CategorySlug = "programming" | "statistics" | "ai" | "accounting";

export type ResourceItem = {
  id: string;
  title: string;
  url: string;
  description: string;
  category: CategorySlug;
  subcategory: string;
  stage: "beginner" | "intermediate" | "advanced";
  scenario: string;
  tags: string[];
  icon: string;
  rating: string;
  recommendedScore: number;
  lastVerifiedAt: string;
  isFeatured: boolean;
};

export type CategoryMeta = {
  slug: CategorySlug;
  name: string;
  shortDescription: string;
  icon: string;
};
