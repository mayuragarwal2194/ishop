export const buildSortQuery = (sort, customSorts = {}) => {
  const defaultSorts = {
    latest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    name_asc: { name: 1 },
    name_desc: { name: -1 },
  };

  // Merge default + custom sorts
  const allSorts = {
    ...defaultSorts,
    ...customSorts,
  };

  // fallback => latest
  return allSorts[sort] || {
    createdAt: -1
  };
};