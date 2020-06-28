import { getCustomRepository } from 'typeorm';
import Category from '../models/Category';
import CategoryRepository from '../repositories/CategoryRepository';

export default class CreateCategoryService {
  public async execute(title: string): Promise<Category> {
    const categoryRepository = getCustomRepository(CategoryRepository);

    const category = categoryRepository.create({ title });

    await categoryRepository.save(category);

    return category;
  }
}
