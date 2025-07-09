import { Router } from 'express';
import spaceRoutes from './spaceRoutes';
import transactionRoutes from './transactionRoutes';
import budgetRoutes from './budgetRoutes';
import recurringTransactionRoutes from './recurringTransactionRoutes';
import khabarRoutes from './khabarRoutes';


const router = Router();

router.use('/spaces', spaceRoutes);
router.use('/spaces/:spaceId/transactions', transactionRoutes);
router.use('/spaces/:spaceId/budget', budgetRoutes);
router.use('/spaces/:spaceId/recurring-transactions', recurringTransactionRoutes);
router.use('/khabar', khabarRoutes);

export default router; 