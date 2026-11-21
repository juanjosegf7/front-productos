import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Product, ProductInput } from "../types/product";

interface ProductFormProps {
  selectedProduct: Product | null;
  saving: boolean;
  onSubmit: (input: ProductInput) => Promise<void>;
  onCancel: () => void;
}

const emptyValues: ProductInput = {
  name: "",
  price: 0,
  stock: 0,
  category: "",
};

export default function ProductForm({
  selectedProduct,
  saving,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductInput>({ defaultValues: emptyValues });

  useEffect(() => {
    reset(
      selectedProduct
        ? {
            name: selectedProduct.name,
            price: selectedProduct.price,
            stock: selectedProduct.stock,
            category: selectedProduct.category,
          }
        : emptyValues,
    );
  }, [selectedProduct, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      name: values.name.trim(),
      category: values.category.trim(),
    });
    if (!selectedProduct) reset(emptyValues);
  });

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {selectedProduct ? "Editar producto" : "Nuevo producto"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {selectedProduct
              ? `Modificando el producto #${selectedProduct.id}`
              : "Completa la información para añadirlo al catálogo."}
          </p>
        </div>
        {selectedProduct && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Cancelar edición
          </button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="product-name">
            Nombre
          </label>
          <input
            id="product-name"
            className="field-input"
            placeholder="Ej. Teclado mecánico"
            {...register("name", {
              required: "El nombre es obligatorio.",
              maxLength: { value: 120, message: "Máximo 120 caracteres." },
              validate: (value) =>
                !!value.trim() || "Escribe un nombre válido.",
            })}
          />
          {errors.name && (
            <p role="alert" className="field-error">
              {errors.name.message}
            </p>
          )}
        </div>
        <div>
          <label className="field-label" htmlFor="product-category">
            Categoría
          </label>
          <input
            id="product-category"
            className="field-input"
            placeholder="Ej. Periféricos"
            {...register("category", {
              required: "La categoría es obligatoria.",
              maxLength: { value: 80, message: "Máximo 80 caracteres." },
              validate: (value) =>
                !!value.trim() || "Escribe una categoría válida.",
            })}
          />
          {errors.category && (
            <p role="alert" className="field-error">
              {errors.category.message}
            </p>
          )}
        </div>
        <div>
          <label className="field-label" htmlFor="product-price">
            Precio (COP)
          </label>
          <input
            id="product-price"
            type="number"
            min="0"
            step="0.01"
            className="field-input"
            {...register("price", {
              valueAsNumber: true,
              required: "El precio es obligatorio.",
              min: { value: 0, message: "El precio no puede ser negativo." },
              validate: (value) =>
                Number.isFinite(value) || "Indica un precio válido.",
            })}
          />
          {errors.price && (
            <p role="alert" className="field-error">
              {errors.price.message}
            </p>
          )}
        </div>
        <div>
          <label className="field-label" htmlFor="product-stock">
            Existencias
          </label>
          <input
            id="product-stock"
            type="number"
            min="0"
            step="1"
            className="field-input"
            {...register("stock", {
              valueAsNumber: true,
              required: "Las existencias son obligatorias.",
              min: { value: 0, message: "No pueden ser negativas." },
              validate: (value) =>
                Number.isInteger(value) || "Debe ser un número entero.",
            })}
          />
          {errors.stock && (
            <p role="alert" className="field-error">
              {errors.stock.message}
            </p>
          )}
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {saving
            ? "Guardando..."
            : selectedProduct
              ? "Guardar cambios"
              : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
