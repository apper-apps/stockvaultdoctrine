import productsData from "@/services/mockData/products.json";

class ProductsService {
  constructor() {
    this.products = [...productsData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.products];
  }

  async getById(id) {
    await this.delay(200);
    const product = this.products.find(p => p.Id === id);
    if (!product) {
      throw new Error("Product not found");
    }
    return { ...product };
  }

  async create(productData) {
    await this.delay(400);
    
    const newProduct = {
      ...productData,
      Id: Math.max(...this.products.map(p => p.Id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.products.push(newProduct);
    return { ...newProduct };
  }

  async update(id, productData) {
    await this.delay(400);
    
    const index = this.products.findIndex(p => p.Id === id);
    if (index === -1) {
      throw new Error("Product not found");
    }
    
    const updatedProduct = {
      ...this.products[index],
      ...productData,
      Id: id,
      updatedAt: new Date().toISOString()
    };
    
    this.products[index] = updatedProduct;
    return { ...updatedProduct };
  }

  async delete(id) {
    await this.delay(300);
    
    const index = this.products.findIndex(p => p.Id === id);
    if (index === -1) {
      throw new Error("Product not found");
    }
    
    this.products.splice(index, 1);
    return true;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const productsService = new ProductsService();