export function buildPageNumbers(page: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);
  const WINDOW = 2;
  const start = Math.max(1, page - WINDOW);
  const end = Math.min(totalPages - 2, page + WINDOW);
  const pages: (number | "...")[] = [0];
  if (start > 1) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 2) pages.push("...");
  pages.push(totalPages - 1);
  return pages;
}
