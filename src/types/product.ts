export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
}

export interface ProductInput {
  name: string;
  price: number;
  stock: number;
  category: string;
}

export type CreateProductInput = ProductInput;
export type UpdateProductInput = ProductInput;
export interface UpdateStockInput {
  stock: number;
}
