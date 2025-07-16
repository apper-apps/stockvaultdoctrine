import transactionsData from "@/services/mockData/transactions.json";

class TransactionsService {
  constructor() {
    this.transactions = [...transactionsData];
  }

  async getAll() {
    await this.delay(200);
    return [...this.transactions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async getById(id) {
    await this.delay(200);
    const transaction = this.transactions.find(t => t.Id === id);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return { ...transaction };
  }

  async create(transactionData) {
    await this.delay(300);
    
    const newTransaction = {
      ...transactionData,
      Id: Math.max(...this.transactions.map(t => t.Id)) + 1,
      timestamp: transactionData.timestamp || new Date().toISOString()
    };
    
    this.transactions.push(newTransaction);
    return { ...newTransaction };
  }

  async update(id, transactionData) {
    await this.delay(300);
    
    const index = this.transactions.findIndex(t => t.Id === id);
    if (index === -1) {
      throw new Error("Transaction not found");
    }
    
    const updatedTransaction = {
      ...this.transactions[index],
      ...transactionData,
      Id: id
    };
    
    this.transactions[index] = updatedTransaction;
    return { ...updatedTransaction };
  }

  async delete(id) {
    await this.delay(250);
    
    const index = this.transactions.findIndex(t => t.Id === id);
    if (index === -1) {
      throw new Error("Transaction not found");
    }
    
    this.transactions.splice(index, 1);
    return true;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const transactionsService = new TransactionsService();