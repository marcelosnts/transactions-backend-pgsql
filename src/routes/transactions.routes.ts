import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import CategoryRepository from '../repositories/CategoryRepository';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ValidateTransactionService from '../services/ValidateTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import AppError from '../errors/AppError';
import UploadConfig from '../config/upload';

const transactionsRouter = Router();
const upload = multer(UploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);

  const serializedTransactions = await transactionRepository.find();
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

  const transactionResponse = await deleteTransactionService.execute(id);

  return response.json(transactionResponse);
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { filename, destination } = request.file;
    const importTransactionService = new ImportTransactionsService();

    const transactions = await importTransactionService.execute(
      destination,
      filename,
    );

    return response.json(transactions);
  },
);

export default transactionsRouter;
