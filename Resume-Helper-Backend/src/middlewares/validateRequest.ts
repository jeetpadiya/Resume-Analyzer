import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error: any) {
      // Zod errors shape: { errors: Array<{ path: (string|number)[], message: string }> }
      const zodErrors = Array.isArray(error?.errors) ? error.errors : null;

      const formattedErrors = zodErrors
        ? zodErrors.map((err: any) => ({
            field: Array.isArray(err?.path) ? err.path.join('.') : 'unknown',
            message: err?.message ?? 'Invalid value',
          }))
        : null;

      return res.status(400).json({
        message: "Validation failed",
        errors: formattedErrors ?? [],
        ...(error?.message ? { debug: error.message } : {}),
      });
    }
  };
};
