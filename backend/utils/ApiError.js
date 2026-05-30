export class ApiError extends Error {
  constructor(statusCode, message, errors = null) {

    super(message);

    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.success = false;
  }
}