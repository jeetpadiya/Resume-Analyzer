# TODO - Resume-Helper token/validation error fix

- [ ] Inspect current error handling in `src/middlewares/validateRequest.ts` and update to safely format Zod errors while handling non-Zod errors.
- [ ] Update `src/middlewares/auth.ts` to detect `TokenExpiredError` and return a clear 401 response.
- [ ] Run backend TypeScript compile / tests (if available) to ensure no runtime/type errors.

