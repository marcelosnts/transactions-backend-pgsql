import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';
import { getCustomRepository, In } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import CategoryRepository from '../repositories/CategoryRepository';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface SerializedTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

async function readCsv(file: string): Promise<SerializedTransaction[]> {
  const csvFileStream = fs.createReadStream(file);
  const csvParseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });
  const transactions: SerializedTransaction[] = [];

  const parseCSV = csvFileStream.pipe(csvParseStream);

  parseCSV.on('data', line => {
    const [title, type, value, category] = line.map((cell: string) =>
      cell.trim(),
    );
    transactions.push({ title, type, value, category });
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  return transactions;
}
class ImportTransactionsService {
  async execute(filePath: string, fileName: string): Promise<Transaction[]> {
    const file = path.join(filePath, fileName);

    const transactions = await readCsv(file);
    const categories = transactions.map(transaction => transaction.category);

    const categoryRepository = getCustomRepository(CategoryRepository);

    const existentCategories = await categoryRepository.find({
      where: { title: In(categories) },
    });

    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoryRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    const CreatedCategories = await categoryRepository.save(newCategories);

    const finalCategories = [...existentCategories, ...CreatedCategories];

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const newTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(category => {
          if (category.title === transaction.category) {
            return category.id;
          }
        }),
      })),
    );

    await transactionsRepository.save(newTransactions);

    await fs.promises.unlink(file);

    return newTransactions;
  }
}

export default ImportTransactionsService;
