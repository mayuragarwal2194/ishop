import { ApiError } from "../utils/ApiError.js";

export const validate = (schema) => {

  return (req, res, next) => {

    const result = schema.safeParse(req.body);

    if (!result.success) {

      const formattedErrors = {};

      result.error.issues.forEach((issue) => {

        const field = issue.path[0];

        formattedErrors[field] = issue.message;
      });

      throw new ApiError(
        400,
        "Validation failed",
        formattedErrors
      );
    }

    req.validatedData = result.data;

    next();
  };
};