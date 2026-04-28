export const ApiResponse = (res, statusCode, message, data, meta) => {
  const response = {
    success: true,
    message,
  };

  // only include data if it exists
  if (data !== undefined) {
    response.data = data;
  }

  // only include meta if it exists
  if (meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};