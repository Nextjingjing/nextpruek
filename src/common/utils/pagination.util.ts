export function getPagination(page: number = 1, limit: number = 10) {
  const take = Math.max(limit, 1);
  const skip = (Math.max(page, 1) - 1) * take;
  return { skip, take };
}