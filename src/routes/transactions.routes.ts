import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import CategoryRepository from '../repositories/CategoryRepository';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ValidateTransactionService from '../services/ValidateTransactionService';

import AppError from '../errors/AppError';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);

  const serializedTransactions = await transactionRepository.serializeTransactions();
  const balance = await transactionRepository.getBalance();

  return response
    .status(200)
    .json({ transactions: serializedTransactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const validateTransactionService = new ValidateTransactionService();

  if (await validateTransactionService.execute(type, value)) {
    const categoryRepository = getCustomRepository(CategoryRepository);

    const foundCategory = await categoryRepository.categoryExists(category);

    const createTransactionService = new CreateTransactionService();

    const transaction = await createTransactionService.execute({
      title,
      value,
      type,
      category_id: foundCategory.id,
    });

    return response.status(200).json(transaction);
  }

  throw new AppError('Transaction unauthorized!');
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransactionService = new DeleteTransactionService();

  const transactionResponse = deleteTransactionService.execute(id);

  return response.json(transactionResponse);
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});

export default transactionsRouter;
