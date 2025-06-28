import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { TransactionModel } from '../models/transactionModel';
import { RecurringTransactionModel } from '../models/recurringTransactionModel';
import { addWeeks, addMonths, addYears, format } from 'date-fns';

const router = Router({ mergeParams: true });

// GET /api/spaces/:spaceId/transactions
router.get('/', [
  param('spaceId').isUUID().withMessage('Invalid spaceId'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['income', 'expense']),
  query('category').optional().isString(),
  query('start_date').optional().isISO8601(),
  query('end_date').optional().isISO8601(),
  query('search').optional().isString(),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { spaceId } = req.params;
    if (!spaceId) {
      return res.status(400).json({ success: false, error: 'Missing spaceId parameter' });
    }
    const filters = {
      ...req.query,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
    };
    const result = await TransactionModel.getTransactions(spaceId, filters);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      stats: result.stats,
      categoryStats: result.categoryStats,
      monthlyStats: result.monthlyStats
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/spaces/:spaceId/transactions
router.post('/', [
  param('spaceId').isUUID().withMessage('Invalid spaceId'),
  body('type').isIn(['income', 'expense']),
  body('amount').isFloat({ gt: 0 }),
  body('category').isString(),
  body('date').isISO8601(),
  body('is_recurring').optional().isBoolean(),
  body('recurrence_frequency').optional().isIn(['weekly', 'monthly', 'yearly']),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { spaceId } = req.params;
    if (!spaceId) {
      return res.status(400).json({ success: false, error: 'Missing spaceId parameter' });
    }
    const transaction = await TransactionModel.createTransaction(spaceId, req.body);
    
    // If this is a recurring transaction, also create a recurring transaction entry
    if (req.body.is_recurring && req.body.recurrence_frequency) {
      try {
        const recurringTransactionData = {
          name: req.body.description || `${req.body.type} - ${req.body.category}`,
          type: req.body.type,
          amount: req.body.amount,
          category: req.body.category,
          subcategory: req.body.subcategory,
          description: req.body.description,
          frequency: req.body.recurrence_frequency,
          start_date: req.body.date,
        };
        
        // Create recurring transaction with special ID and source for regular transactions
        const recurringTransaction = await RecurringTransactionModel.createRecurringTransactionFromRegular(
          spaceId, 
          transaction.id,
          recurringTransactionData
        );
        console.log(`[TransactionRoutes] Created recurring transaction entry for transaction ${transaction.id}`);
      } catch (error) {
        console.error(`[TransactionRoutes] Failed to create recurring transaction entry:`, error);
        // Don't fail the main transaction creation if recurring entry fails
      }
    }
    
    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
});

// PUT /api/spaces/:spaceId/transactions/:transactionId
router.put('/:transactionId', [
  param('spaceId').isUUID().withMessage('Invalid spaceId'),
  param('transactionId').isUUID().withMessage('Invalid transactionId'),
  body('type').optional().isIn(['income', 'expense']),
  body('amount').optional().isFloat({ gt: 0 }),
  body('category').optional().isString(),
  body('date').optional().isISO8601(),
  body('is_recurring').optional().isBoolean(),
  body('recurrence_frequency').optional().isIn(['weekly', 'monthly', 'yearly']),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { spaceId, transactionId } = req.params;
    if (!spaceId || !transactionId) {
      return res.status(400).json({ success: false, error: 'Missing spaceId or transactionId parameter' });
    }
    
    // Get the current transaction to check its recurring status
    const currentTransaction = await TransactionModel.getTransactionById(spaceId, transactionId);
    if (!currentTransaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    
    const transaction = await TransactionModel.updateTransaction(spaceId, transactionId, req.body);
    
    // Handle recurring transaction synchronization
    const isCurrentlyRecurring = currentTransaction.is_recurring;
    const willBeRecurring = req.body.is_recurring !== undefined ? req.body.is_recurring : isCurrentlyRecurring;
    const hasFrequency = req.body.recurrence_frequency || currentTransaction.recurrence_frequency;
    
    // Find existing recurring transaction for this transaction
    const existingRecurringTransactions = await RecurringTransactionModel.getRecurringTransactions(spaceId);
    const existingRecurring = existingRecurringTransactions.find(rt => 
      rt.source === 'regular_transaction' && rt.id === `regular-${transactionId}`
    );
    
    if (willBeRecurring && hasFrequency) {
      // Transaction should be recurring
      if (existingRecurring) {
        // Update existing recurring transaction
        const updateData = {
          name: req.body.description || transaction.description || `${req.body.type || transaction.type} - ${req.body.category || transaction.category}`,
          type: req.body.type || transaction.type,
          amount: req.body.amount || transaction.amount,
          category: req.body.category || transaction.category,
          subcategory: req.body.subcategory || transaction.subcategory,
          description: req.body.description || transaction.description,
          frequency: req.body.recurrence_frequency || transaction.recurrence_frequency,
          start_date: req.body.date || transaction.date,
        };
        
        await RecurringTransactionModel.updateRecurringTransaction(spaceId, existingRecurring.id, updateData);
        console.log(`[TransactionRoutes] Updated recurring transaction entry for transaction ${transactionId}`);
      } else {
        // Create new recurring transaction entry
        const recurringTransactionData = {
          name: req.body.description || transaction.description || `${req.body.type || transaction.type} - ${req.body.category || transaction.category}`,
          type: req.body.type || transaction.type,
          amount: req.body.amount || transaction.amount,
          category: req.body.category || transaction.category,
          subcategory: req.body.subcategory || transaction.subcategory,
          description: req.body.description || transaction.description,
          frequency: req.body.recurrence_frequency || transaction.recurrence_frequency,
          start_date: req.body.date || transaction.date,
        };
        
        await RecurringTransactionModel.createRecurringTransactionFromRegular(spaceId, transactionId, recurringTransactionData);
        console.log(`[TransactionRoutes] Created recurring transaction entry for updated transaction ${transactionId}`);
      }
    } else if (isCurrentlyRecurring && !willBeRecurring && existingRecurring) {
      // Transaction is being changed from recurring to non-recurring
      await RecurringTransactionModel.deleteRecurringTransaction(spaceId, existingRecurring.id);
      console.log(`[TransactionRoutes] Deleted recurring transaction entry for transaction ${transactionId} (changed to non-recurring)`);
    }
    
    res.json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/spaces/:spaceId/transactions/:transactionId
router.delete('/:transactionId', [
  param('spaceId').isUUID().withMessage('Invalid spaceId'),
  param('transactionId').isUUID().withMessage('Invalid transactionId'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { spaceId, transactionId } = req.params;
    if (!spaceId || !transactionId) {
      return res.status(400).json({ success: false, error: 'Missing spaceId or transactionId parameter' });
    }
    await TransactionModel.deleteTransaction(spaceId, transactionId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router; 