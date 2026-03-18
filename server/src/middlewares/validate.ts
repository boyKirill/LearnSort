import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

import { HttpError } from '../utils/http-error.js';

interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body) as never;
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as never;
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as never;
      }

      next();
    } catch (error) {
      next(new HttpError(400, 'Некорректные входные данные.', error));
    }
  };
}
