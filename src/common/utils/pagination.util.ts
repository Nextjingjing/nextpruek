export function getPagination(page: number = 1, limit: number = 10) {
  const maxLimit = 100;
  const safeLimit = Math.min(limit, maxLimit);
  const take = Math.max(safeLimit, 1);
  const skip = (Math.max(page, 1) - 1) * take;
  return { skip, take };
}