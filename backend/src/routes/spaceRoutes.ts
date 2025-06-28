import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { SpaceModel } from '../models/spaceModel';

const router = Router();

// POST /api/spaces - Create a new space
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await SpaceModel.createSpace();
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// GET /api/spaces/:spaceId - Get space details
router.get('/:spaceId', [
  param('spaceId').isUUID().withMessage('Invalid spaceId'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { spaceId } = req.params;
    if (!spaceId) {
      return res.status(400).json({ success: false, error: 'Missing spaceId parameter' });
    }
    const space = await SpaceModel.getSpaceById(spaceId);
    if (!space) {
      return res.status(404).json({ success: false, error: 'Space not found' });
    }
    res.json({ success: true, data: space });
  } catch (err) {
    next(err);
  }
});

export default router; 