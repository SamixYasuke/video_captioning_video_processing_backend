/**
 * A custom Error class for handling HTTP errors with an optional data payload.
 * Extends the built-in Error class to include a status code and optional error data.
 *
 * @template T - Type of the optional data payload (defaults to any)
 * @param {string} message - The error message describing the issue
 * @param {number} statusCode - The HTTP status code (e.g., 400, 404)
 * @param {T} [data] - Optional additional data (e.g., error details, context)
 */
export class ApiError<T = any> extends Error {
  public readonly statusCode: number;
  public readonly data?: T;

  constructor(message: string, statusCode: number, data?: T) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
