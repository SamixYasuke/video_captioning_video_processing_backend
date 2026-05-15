import { Request, Response, NextFunction } from "express";
import { ApiError } from "./apierror";

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      message: err.message,
      errors: err?.data,
    });
  } else {
    res.status(500).json({
      message: err.message || "Internal Server Error",
    });
  }
};

export default errorHandler;
