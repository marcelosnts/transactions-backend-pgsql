import { getCustomRepository, DeleteResult } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<string> {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const transaction = await transactionRepository.findOne({ where: { id } });

    if (transaction) {
      transactionRepository.delete(transaction?.id);

      return 'Transaction deleted!';
    }

    throw new AppError('Transaction was not found', 401);
  }
}

export default DeleteTransactionService;
