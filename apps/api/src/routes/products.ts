import type { Product } from '@1fi/shared';
import { Router } from 'express';
import type { Request, Response } from 'express';
import productsData from '../data/products.json';

const products: Product[] = productsData as Product[];

export const productsRouter = Router();

// GET /api/products — optional ?category=smartphone|laptop filter.
// An unknown category matches nothing (frontend renders its empty state).
productsRouter.get('/', (req: Request, res: Response) => {
  const { category } = req.query;
  const data =
    typeof category === 'string' && category !== ''
      ? products.filter((p) => p.category === category)
      : products;
  res.status(200).json({ ok: true, data });
});

// GET /api/products/:id — 404 envelope when the id doesn't resolve.
productsRouter.get('/:id', (req: Request, res: Response) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    res
      .status(404)
      .json({ ok: false, error: { message: 'Product not found', code: 'NOT_FOUND' } });
    return;
  }
  res.status(200).json({ ok: true, data: product });
});
