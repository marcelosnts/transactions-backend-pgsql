import { getCustomRepository } from 'typeorm';

import TransactionRepository from '../repositories/TransactionsRepository';

export default class ValidateTransactionService {
  public async execute(type: string, value: number): Promise<boolean> {
    if (type === 'outcome') {
      const transactionRepository = getCustomRepository(TransactionRepository);
      const { total } = await transactionRepository.getBalance();

      if (total < value) {
        return false;
      }
    }

    return true;
  }
}
