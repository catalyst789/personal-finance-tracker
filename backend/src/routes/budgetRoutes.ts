import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { BudgetModel } from '../models/budgetModel';

const router = Router({ mergeParams: true });

// GET /api/spaces/:spaceId/budget
router.get('/', [
  param('spaceId').isUUID().withMessage('Invalid spaceId'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { spaceId } = req.params;
    if (!spaceId) {
      return res.status(400).json({ success: false, error: 'Missing spaceId parameter' });
    }
    const budget = await BudgetModel.getBudget(spaceId);
    if (!budget) {
      return res.status(404).json({ success: false, error: 'Budget not found' });
    }
    return res.json({ success: true, data: budget });
  } catch (err) {
    return next(err);
  }
});

// POST /api/spaces/:spaceId/budget
router.post('/', [
  param('spaceId').isUUID().withMessage('Invalid spaceId'),
  body('monthly_budget').isFloat({ gt: 0 }),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { spaceId } = req.params;
    if (!spaceId) {
      return res.status(400).json({ success: false, error: 'Missing spaceId parameter' });
    }
    const budget = await BudgetModel.setBudget(spaceId, req.body);
    return res.status(201).json({ success: true, data: budget });
  } catch (err) {
    return next(err);
  }
});

// PUT /api/spaces/:spaceId/budget
router.put('/', [
  param('spaceId').isUUID().withMessage('Invalid spaceId'),
  body('monthly_budget').isFloat({ gt: 0 }),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { spaceId } = req.params;
    if (!spaceId) {
      return res.status(400).json({ success: false, error: 'Missing spaceId parameter' });
    }
    const budget = await BudgetModel.setBudget(spaceId, req.body);
    return res.json({ success: true, data: budget });
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/spaces/:spaceId/budget
router.delete('/', [
  param('spaceId').isUUID().withMessage('Invalid spaceId'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { spaceId } = req.params;
    if (!spaceId) {
      return res.status(400).json({ success: false, error: 'Missing spaceId parameter' });
    }
    await BudgetModel.deleteBudget(spaceId);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

export default router; 