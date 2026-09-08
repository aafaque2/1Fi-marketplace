import type { NextFunction, Request, Response } from 'express';

const MIN_DELAY_MS = 400;
const MAX_DELAY_MS = 900;
const RANDOM_FAILURE_RATE = 0.05;

function isExplicitSimulatedError(req: Request): boolean {
  return (
    req.header('x-simulate-error') === 'true' || req.query.simulateError === 'true'
  );
}

function sendSimulatedFailure(res: Response): void {
  res
    .status(500)
    .json({ ok: false, error: { message: 'Simulated failure', code: 'SIMULATED' } });
}

/**
 * Simulated network behavior (SPEC.md §5). Applies to every route:
 * - Random 400–900ms delay on every response, so loading states stay visible.
 * - Short-circuits to the simulated-failure response when the request carries
 *   header `x-simulate-error: true` or query `?simulateError=true`.
 * - Independently, a 5% random chance of the same failure on any request.
 */
export function simulateNetwork(req: Request, res: Response, next: NextFunction): void {
  const delayMs = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
  setTimeout(() => {
    if (isExplicitSimulatedError(req) || Math.random() < RANDOM_FAILURE_RATE) {
      sendSimulatedFailure(res);
      return;
    }
    next();
  }, delayMs);
}
