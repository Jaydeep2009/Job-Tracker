import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationErrorResponse {
  message: string;
  errors: ValidationError[];
}

/**
 * Generic validation middleware factory
 * Validates request body, query, and params against a Zod schema
 */
export function validate(schema: ZodTypeAny) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate and parse the request
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace request data with validated & sanitized data
      if ((validated as any).body !== undefined) {
        req.body = (validated as any).body;
      }
      if ((validated as any).query !== undefined) {
        Object.assign(req.query, (validated as any).query);
      }
      if ((validated as any).params !== undefined) {
        req.params = (validated as any).params;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: ValidationError[] = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        const response: ValidationErrorResponse = {
          message: 'Validation failed',
          errors,
        };

        return res.status(400).json(response);
      }

      // Unexpected error
      next(error);
    }
  };
}
