import categoriesData from "@/services/mockData/categories.json";

class CategoriesService {
  constructor() {
    this.categories = [...categoriesData];
  }

  async getAll() {
    await this.delay(250);
    return [...this.categories];
  }

  async getById(id) {
    await this.delay(200);
    const category = this.categories.find(c => c.Id === id);
    if (!category) {
      throw new Error("Category not found");
    }
    return { ...category };
  }

  async create(categoryData) {
    await this.delay(350);
    
    const newCategory = {
      ...categoryData,
      Id: Math.max(...this.categories.map(c => c.Id)) + 1
    };
    
    this.categories.push(newCategory);
    return { ...newCategory };
  }

  async update(id, categoryData) {
    await this.delay(350);
    
    const index = this.categories.findIndex(c => c.Id === id);
    if (index === -1) {
      throw new Error("Category not found");
    }
    
    const updatedCategory = {
      ...this.categories[index],
      ...categoryData,
      Id: id
    };
    
    this.categories[index] = updatedCategory;
    return { ...updatedCategory };
  }

  async delete(id) {
    await this.delay(300);
    
    const index = this.categories.findIndex(c => c.Id === id);
    if (index === -1) {
      throw new Error("Category not found");
    }
    
    this.categories.splice(index, 1);
    return true;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const categoriesService = new CategoriesService();