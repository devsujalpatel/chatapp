import { HttpError } from "../errors/http-error";

import type { NextFunction, Request, Response } from "express";
import { ZodError, ZodType, ZodObject } from "zod";

type Schema = ZodObject<any> | ZodType<any, any>;
type ParamsRecord = Record<string, string>;
type QueryRecord = Record<string, any>;

export interface RequestValidationSchemas {
  body?: Schema;
  params?: Schema;
  query?: Schema;
}

const formatedError = (error: ZodError) =>
  error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));

export const validateRequest = (schemas: RequestValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as ParamsRecord;
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as QueryRecord; // Fixed target to req.query
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          new HttpError(422, "Validation Error", {
            issues: formatedError(error),
          }),
        );
      }
      next(error);
    }
  };
};
