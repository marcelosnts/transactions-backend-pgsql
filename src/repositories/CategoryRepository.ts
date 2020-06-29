import { EntityRepository, Repository } from 'typeorm';
import Category from '../models/Category';

@EntityRepository(Category)
export default class CategoryRepository extends Repository<Category> {
  public async categoryExists(title: string): Promise<Category> {
    const category = await this.findOne({ where: { title } });

    if (!category) {
      const newCategory = this.create({ title });

      const createdCategory = await this.save(newCategory);

      return createdCategory;
    }

    return category;
  }
}
