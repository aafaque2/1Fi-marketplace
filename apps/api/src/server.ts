import cors from 'cors';
import express from 'express';
import type { Request, Response } from 'express';
import { simulateNetwork } from './middleware/simulateNetwork';
import { checkoutRouter } from './routes/checkout';
import { emiPlansRouter } from './routes/emiPlans';
import { productsRouter } from './routes/products';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN ?? true }));
app.use(express.json());

// Simulated network behavior on every route (SPEC.md §5).
app.use(simulateNetwork);

app.use('/api/products', productsRouter);
app.use('/api/products', emiPlansRouter);
app.use('/api/checkout', checkoutRouter);

// Unknown paths still answer with the ApiEnvelope shape.
app.use((req: Request, res: Response) => {
  res
    .status(404)
    .json({ ok: false, error: { message: 'Not found', code: 'NOT_FOUND' } });
});

app.listen(PORT, () => {
  console.log(`1Fi mock API listening on http://localhost:${PORT}`);
});
