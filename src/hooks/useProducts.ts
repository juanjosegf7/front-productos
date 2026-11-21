import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../api/products";

const productsKey = ["products"] as const;

export const useProductDetail = (id: number | null) =>
  useQuery({
    queryKey: ["products", id],
    queryFn: ({ signal }) => productApi.get(id!, signal),
    enabled: id !== null,
  });

export const useProducts = () =>
  useQuery({
    queryKey: productsKey,
    queryFn: ({ signal }) => productApi.list(signal),
    retry: 1,
  });

export function useProductActions() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: productsKey });
  const create = useMutation({
    mutationFn: productApi.create,
    onSuccess: invalidate,
  });
  const updateStock = useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) =>
      productApi.updateStock(id, { stock }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: productApi.remove,
    onSuccess: invalidate,
  });
  return { create, updateStock, remove };
}
