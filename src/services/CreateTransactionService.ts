// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_id: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category_id,
  }: Request): Promise<Transaction | undefined> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id,
    });

    const transactionCreated = await transactionRepository.save(transaction);

    const newTransaction = await transactionRepository.findOne({
      where: { id: transactionCreated.id },
    });

    return newTransaction;
  }
}

export default CreateTransactionService;
