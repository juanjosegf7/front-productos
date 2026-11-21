import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import ProductForm from "./components/ProductForm";
import { useProducts, useProductActions } from "./hooks/useProducts";
import type { Product, ProductInput } from "./types/product";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 2,
  }).format(value);

export default function App() {
  const {
    data: products = [],
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useProducts();
  const { create, update, remove } = useProductActions();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  const saveProduct = async (input: ProductInput) => {
    setActionError("");
    setNotice("");
    try {
      if (selectedProduct) {
        await update.mutateAsync({ id: selectedProduct.id, data: input });
        setNotice("Producto actualizado correctamente.");
        setSelectedProduct(null);
      } else {
        await create.mutateAsync(input);
        setNotice("Producto creado correctamente.");
      }
    } catch (cause) {
      setActionError(
        cause instanceof Error
          ? cause.message
          : "No se pudo guardar el producto.",
      );
    }
  };

  const deleteProduct = async (product: Product) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar «${product.name}»? Esta acción no se puede deshacer.`,
      )
    )
      return;
    setActionError("");
    setNotice("");
    try {
      await remove.mutateAsync(product.id);
      if (selectedProduct?.id === product.id) setSelectedProduct(null);
      setNotice("Producto eliminado correctamente.");
    } catch (cause) {
      setActionError(
        cause instanceof Error
          ? cause.message
          : "No se pudo eliminar el producto.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Gestor de productos
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Administra el catálogo desde un solo lugar.
          </p>
        </header>

        {notice && (
          <div
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            {notice}
          </div>
        )}
        {actionError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {actionError}
          </div>
        )}

        <ProductForm
          key={selectedProduct?.id ?? "new"}
          selectedProduct={selectedProduct}
          saving={create.isPending || update.isPending}
          onSubmit={saveProduct}
          onCancel={() => {
            setSelectedProduct(null);
            setActionError("");
          }}
        />

        <section
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          aria-label="Listado de productos"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-lg font-semibold">Productos registrados</h2>
              <p className="mt-1 text-sm text-slate-500">
                {products.length}{" "}
                {products.length === 1 ? "producto" : "productos"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {isFetching ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
          {isPending ? (
            <p className="p-6 text-sm text-slate-600">Cargando productos...</p>
          ) : isError ? (
            <div className="p-6 text-sm text-red-700" role="alert">
              {error.message}{" "}
              <button className="ml-2 underline" onClick={() => void refetch()}>
                Reintentar
              </button>
            </div>
          ) : products.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">
              Todavía no hay productos. Registra uno en el formulario.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">ID</th>
                    <th className="px-5 py-3 font-semibold">Producto</th>
                    <th className="px-5 py-3 font-semibold">Categoría</th>
                    <th className="px-5 py-3 font-semibold">Precio</th>
                    <th className="px-5 py-3 font-semibold">Stock</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className={
                        selectedProduct?.id === product.id
                          ? "bg-blue-50"
                          : "hover:bg-slate-50"
                      }
                    >
                      <td className="px-5 py-4 text-slate-500">{product.id}</td>
                      <td className="px-5 py-4 font-medium">{product.name}</td>
                      <td className="px-5 py-4">{product.category}</td>
                      <td className="px-5 py-4 tabular-nums">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-5 py-4 tabular-nums">
                        {product.stock}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            title="Editar producto"
                            aria-label={`Editar ${product.name}`}
                            onClick={() => {
                              setSelectedProduct(product);
                              setNotice("");
                              setActionError("");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            type="button"
                            title="Eliminar producto"
                            aria-label={`Eliminar ${product.name}`}
                            disabled={remove.isPending}
                            onClick={() => void deleteProduct(product)}
                            className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
