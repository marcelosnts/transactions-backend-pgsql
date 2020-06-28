import { EntityRepository, Repository } from 'typeorm';
import Category from '../models/Category';
import CreateCategoryService from '../services/CreateCategoryService';

@EntityRepository(Category)
export default class CategoryRepository extends Repository<Category> {
  public async categoryExists(title: string): Promise<Category> {
    const category = await this.findOne({ where: { title } });

    if (!category) {
      const createCategoryService = new CreateCategoryService();

      const categoryCreated = await createCategoryService.execute(title);

      return categoryCreated;
    }

    return category;
  }
}
