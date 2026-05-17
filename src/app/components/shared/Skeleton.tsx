/* Reusable skeleton blocks for loading states (A2). */

interface SkeletonProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  rounded?: "none" | "sm" | "md" | "full";
}

const RADIUS = { none: "0", sm: "2px", md: "4px", full: "999px" };

export function Skeleton({ className = "", width, height = 12, rounded = "sm" }: SkeletonProps) {
  return (
    <span
      className={`scca-skel inline-block align-middle ${className}`}
      style={{ width, height, borderRadius: RADIUS[rounded] }}
      aria-hidden="true"
    />
  );
}

export function SkeletonKPI() {
  return (
    <div className="border border-[var(--scca-hair)] rounded-md p-[var(--scca-card-pad)]">
      <div className="flex items-center justify-between mb-3">
        <Skeleton width={28} height={28} rounded="sm" />
        <Skeleton width={60} height={12} />
      </div>
      <Skeleton width="55%" height={14} className="mb-2" />
      <Skeleton width="35%" height={28} rounded="sm" className="mb-3" />
      <Skeleton width="100%" height={2} />
      <div className="flex justify-between mt-2">
        <Skeleton width={60} height={9} />
        <Skeleton width={40} height={9} />
      </div>
    </div>
  );
}

export function SkeletonRow({ cols = 6 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-[var(--scca-row-px)] py-[var(--scca-row-py)]">
          <Skeleton width={`${50 + ((i * 13) % 40)}%`} height={12} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonChart({ height = 180 }: { height?: number }) {
  return (
    <div className="border border-[var(--scca-hair)] rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <Skeleton width={120} height={14} />
        <Skeleton width={60} height={12} />
      </div>
      <Skeleton width="100%" height={height} rounded="sm" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? "65%" : "100%"} height={13} />
      ))}
    </div>
  );
}
