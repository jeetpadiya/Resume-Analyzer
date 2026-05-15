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
      const formattedErrors = error.errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return res.status(400).json({
        message: "Validation failed",
        errors: formattedErrors,
      });
    }
  };
};
