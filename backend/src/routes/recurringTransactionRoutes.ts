import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { RecurringTransactionModel } from '../models/recurringTransactionModel';
import { TransactionModel } from '../models/transactionModel';

const router = Router({ mergeParams: true });

// GET /api/spaces/:spaceId/recurring-transactions
router.get('/', [
  param('spaceId').isUUID().withMessage('Invalid spaceId'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { spaceId } = req.params;
    if (!spaceId) {
      return res.status(400).json({ success: false, error: 'Missing spaceId parameter' });
    }
    const recurringTransactions = await RecurringTransactionModel.getRecurringTransactions(spaceId);
    return res.json({ success: true, data: recurringTransactions });
  } catch (err) {
    return next(err);
  }
});

// POST /api/spaces/:spaceId/recurring-transactions
router.post('/', [
  param('spaceId').isUUID().withMessage('Invalid spaceId'),
  body('name').isString().notEmpty().withMessage('Name is required'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('category').isString().notEmpty().withMessage('Category is required'),
  body('frequency').isIn(['weekly', 'monthly', 'yearly']).withMessage('Frequency must be weekly, monthly, or yearly'),
  body('start_date').isISO8601().withMessage('Start date must be a valid date'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { spaceId } = req.params;
    if (!spaceId) {
      return res.status(400).json({ success: false, error: 'Missing spaceId parameter' });
    }
    const recurringTransaction = await RecurringTransactionModel.createRecurringTransaction(spaceId, req.body);
    return res.status(201).json({ success: true, data: recurringTransaction });
  } catch (err) {
    return next(err);
  }
});

// PUT /api/spaces/:spaceId/recurring-transactions/:transactionId
router.put('/:transactionId', [
  param('spaceId').isUUID().withMessage('Invalid spaceId'),
  param('transactionId').isUUID().withMessage('Invalid transactionId'),
  body('name').optional().isString().notEmpty(),
  body('type').optional().isIn(['income', 'expense']),
  body('amount').optional().isFloat({ gt: 0 }),
  body('category').optional().isString().notEmpty(),
  body('frequency').optional().isIn(['weekly', 'monthly', 'yearly']),
  body('start_date').optional().isISO8601(),
  body('is_active').optional().isBoolean(),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { spaceId, transactionId } = req.params;
    if (!spaceId || !transactionId) {
      return res.status(400).json({ success: false, error: 'Missing spaceId or transactionId parameter' });
    }
    const recurringTransaction = await RecurringTransactionModel.updateRecurringTransaction(spaceId, transactionId, req.body);
    return res.json({ success: true, data: recurringTransaction });
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/spaces/:spaceId/recurring-transactions/:transactionId
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
    await RecurringTransactionModel.deleteRecurringTransaction(spaceId, transactionId);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

// POST /api/spaces/:spaceId/recurring-transactions/process
router.post('/process', [
  param('spaceId').isUUID().withMessage('Invalid spaceId'),
  validateRequest
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { spaceId } = req.params;
    if (!spaceId) {
      return res.status(400).json({ success: false, error: 'Missing spaceId parameter' });
    }

    // Get due recurring transactions
    const dueTransactions = await RecurringTransactionModel.processDueRecurringTransactions(spaceId);
    
    const processedTransactions = [];
    
    // Process each due transaction
    for (const recurringTransaction of dueTransactions) {
      try {
        // Create the actual transaction
        const transactionData: any = {
          type: recurringTransaction.type,
          amount: recurringTransaction.amount,
          category: recurringTransaction.category,
          date: recurringTransaction.next_due_date,
          is_recurring: true,
          recurrence_frequency: recurringTransaction.frequency,
        };
        
        // Only add optional fields if they exist
        if (recurringTransaction.subcategory) {
          transactionData.subcategory = recurringTransaction.subcategory;
        }
        if (recurringTransaction.description) {
          transactionData.description = recurringTransaction.description;
        }
        
        const transaction = await TransactionModel.createTransaction(spaceId, transactionData);
        
        // Update the recurring transaction's next due date
        await RecurringTransactionModel.updateNextDueDate(
          recurringTransaction.id,
          recurringTransaction.next_due_date,
          recurringTransaction.frequency
        );
        
        processedTransactions.push({
          recurringTransaction,
          createdTransaction: transaction,
        });
      } catch (error) {
        console.error(`Failed to process recurring transaction ${recurringTransaction.id}:`, error);
      }
    }
    
    return res.json({ 
      success: true, 
      data: {
        processed: processedTransactions.length,
        transactions: processedTransactions
      }
    });
  } catch (err) {
    return next(err);
  }
});

export default router; 