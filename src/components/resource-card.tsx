import type { ResourceItem } from "@/types/resource";

type ResourceCardProps = {
  resource: ResourceItem;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
};

export function ResourceCard({
  resource,
  isFavorite = false,
  onToggleFavorite,
}: ResourceCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:border-cyan-300/40 hover:bg-white/10">
      <div className="mb-3 flex items-center gap-3">
        <img
          src={resource.icon}
          alt={`${resource.title} icon`}
          className="h-8 w-8 rounded-md bg-white object-contain p-1"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = "/globe.svg";
          }}
        />
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-white">
            {resource.title}
          </h3>
          <p className="text-xs text-zinc-400">{resource.rating}</p>
        </div>
      </div>
      <p className="mb-4 min-h-10 text-sm leading-6 text-zinc-300">
        {resource.description}
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        {resource.tags.map((tag) => (
          <span
            key={`${resource.id}-${tag}`}
            className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-0.5 text-xs text-cyan-200"
          >
            #{tag}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>最近验证: {resource.lastVerifiedAt}</span>
        <div className="flex items-center gap-2">
          {onToggleFavorite ? (
            <button
              onClick={() => onToggleFavorite(resource.id)}
              className="rounded border border-amber-300/40 px-2 py-0.5 text-amber-200 hover:bg-amber-300/10"
            >
              {isFavorite ? "已收藏" : "收藏"}
            </button>
          ) : null}
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-cyan-300 hover:text-cyan-200"
          >
            访问链接 →
          </a>
        </div>
      </div>
    </article>
  );
}
