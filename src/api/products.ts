import type { Product, ProductInput, UpdateStockInput } from "../types/product";

const configuredUrl = (import.meta.env.VITE_API_BASE_URL || "")
  .trim()
  .replace(/\/$/, "");
const apiBaseUrl = import.meta.env.DEV ? "" : configuredUrl;

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
    response = await fetch(`${apiBaseUrl}/api/productos${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      signal: options.signal ?? AbortSignal.timeout(10000),
    });
  } catch {
    throw new ApiError(
      "No se pudo conectar con el servidor. Comprueba que Spring Boot esté encendido.",
      0,
    );
  }
  if (!response.ok) {
    let message =
      response.status === 404
        ? "El producto no existe."
        : response.status === 400
          ? "Revisa la información del formulario."
          : `Error del servidor (HTTP ${response.status}).`;
    try {
      const result = (await response.json()) as { error?: string };
      if (result.error && response.status !== 400) message = result.error;
    } catch {
      message = message || `Error HTTP ${response.status}`;
    }
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const productApi = {
  list: (signal?: AbortSignal) => request<Product[]>("", { signal }),
  get: (id: number, signal?: AbortSignal) =>
    request<Product>(`/${id}`, { signal }),
  create: (data: ProductInput) =>
    request<Product>("", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: ProductInput) =>
    request<Product>(`/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateStock: (id: number, data: UpdateStockInput) =>
    request<Product>(`/${id}/stock`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (id: number) => request<void>(`/${id}`, { method: "DELETE" }),
};
