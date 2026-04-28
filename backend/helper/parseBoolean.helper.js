// Helper function to parse boolean values
export const parseBoolean = (val) =>
  val !== undefined ? (val === "true" || val === true) : undefined;