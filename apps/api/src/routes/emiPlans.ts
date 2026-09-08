import type { Product } from '@1fi/shared';
import { calculateEmiPlans } from '@1fi/shared';
import { Router } from 'express';
import type { Request, Response } from 'express';
import productsData from '../data/products.json';

const products: Product[] = productsData as Product[];

export const emiPlansRouter = Router();

// GET /api/products/:id/emi-plans?variantId= (variantId required).
// 404 envelope when the product or variant doesn't resolve.
emiPlansRouter.get('/:id/emi-plans', (req: Request, res: Response) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    res
      .status(404)
      .json({ ok: false, error: { message: 'Product not found', code: 'NOT_FOUND' } });
    return;
  }

  const { variantId } = req.query;
  const variant = product.variants.find((v) => v.id === variantId);
  if (!variant) {
    res
      .status(404)
      .json({ ok: false, error: { message: 'Variant not found', code: 'NOT_FOUND' } });
    return;
  }

  const totalPrice = product.basePrice + variant.priceDelta;
  res.status(200).json({ ok: true, data: calculateEmiPlans(totalPrice) });
});
