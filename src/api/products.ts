import type {
  CreateProductInput,
  Product,
  UpdateStockInput,
} from "../types/product";

const baseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/productos${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      signal: options.signal ?? AbortSignal.timeout(10000),
    });
  } catch {
    throw new ApiError(
      "No se pudo conectar con el servidor. Verifica que el backend esté encendido.",
      0,
    );
  }
  if (!response.ok) {
    throw new ApiError(
      response.status === 404
        ? "No se encontró el producto."
        : response.status === 400
          ? "Verifica la información ingresada."
          : `La solicitud falló (HTTP ${response.status}).`,
      response.status,
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const productApi = {
  list: (signal?: AbortSignal) => request<Product[]>("", { signal }),
  get: (id: number, signal?: AbortSignal) =>
    request<Product>(`/${id}`, { signal }),
  create: (data: CreateProductInput) =>
    request<Product>("", { method: "POST", body: JSON.stringify(data) }),
  updateStock: (id: number, data: UpdateStockInput) =>
    request<Product>(`/${id}/stock`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (id: number) => request<void>(`/${id}`, { method: "DELETE" }),
};
