export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
}

export interface CreateProductInput {
  name: string;
  price: number;
  stock: number;
  category: string;
}

export interface UpdateStockInput {
  stock: number;
}

export type ProductFilter = "all" | "available" | "out";
