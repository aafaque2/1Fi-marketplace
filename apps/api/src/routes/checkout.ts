import { randomBytes } from 'node:crypto';
import type { CheckoutRequest, CheckoutResponse, Product } from '@1fi/shared';
import { Router } from 'express';
import type { Request, Response } from 'express';
import productsData from '../data/products.json';

const products: Product[] = productsData as Product[];

export const checkoutRouter = Router();

// POST /api/checkout — mock that always confirms (modulo the simulated
// failure behavior in §5). Unknown product/variant ids 404 like the
// read routes; a missing field is a 400.
checkoutRouter.post('/', (req: Request, res: Response) => {
  const { productId, variantId, emiPlanId } = req.body as Partial<CheckoutRequest>;

  if (!productId || !variantId || !emiPlanId) {
    res.status(400).json({
      ok: false,
      error: {
        message: 'productId, variantId and emiPlanId are required',
        code: 'BAD_REQUEST',
      },
    });
    return;
  }

  const product = products.find((p) => p.id === productId);
  const variant = product?.variants.find((v) => v.id === variantId);
  if (!product || !variant) {
    res.status(404).json({
      ok: false,
      error: { message: 'Product or variant not found', code: 'NOT_FOUND' },
    });
    return;
  }

  const data: CheckoutResponse = {
    orderId: `1fi_${Date.now().toString(36)}${randomBytes(4).toString('hex')}`,
    status: 'confirmed',
  };
  res.status(200).json({ ok: true, data });
});
