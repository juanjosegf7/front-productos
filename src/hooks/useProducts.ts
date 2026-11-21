import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../api/products";
import type { Product, ProductInput } from "../types/product";

const productsKey = ["products"] as const;

export function useProducts() {
  return useQuery({
    queryKey: productsKey,
    queryFn: ({ signal }) => productApi.list(signal),
    retry: 1,
  });
}

export function useProductActions() {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: productsKey });
  const create = useMutation({
    mutationFn: productApi.create,
    onSuccess: (created) => {
      queryClient.setQueryData<Product[]>(productsKey, (current) =>
        current ? [...current, created] : [created],
      );
      void refresh();
    },
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductInput }) =>
      productApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<Product[]>(productsKey, (current) =>
        current?.map((item) => (item.id === updated.id ? updated : item)),
      );
      void refresh();
    },
  });
  const remove = useMutation({
    mutationFn: productApi.remove,
    onSuccess: (_, id) => {
      queryClient.setQueryData<Product[]>(productsKey, (current) =>
        current?.filter((item) => item.id !== id),
      );
      void refresh();
    },
  });
  return { create, update, remove };
}
