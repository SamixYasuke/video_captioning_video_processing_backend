import { ApiError } from "@/errors/apierror";
import HttpStatusCode from "@/utils/httpStatus";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

const validate = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ApiError(
      "Validation error",
      HttpStatusCode.BAD_REQUEST,
      errors.array()
    );
  }

  next();
};

export default validate;
