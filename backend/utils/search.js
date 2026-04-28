export const buildSearchQuery = (search, fields = []) => {
  if (!search || !fields.length) return {};

  return {
    $or: fields.map(field => ({
      [field]: { $regex: search, $options: "i" } // case-insensitive
    }))
  };
};