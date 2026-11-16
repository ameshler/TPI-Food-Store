import { useForm } from '@tanstack/react-form'

import type { Categoria } from '../../categorias/types/categoria'

export interface ProductoFormValues {
  categoria_id: number
  nombre: string
  descripcion: string
  precio_base: number
  imagen_url: string
  stock: number
  disponible: boolean
}

interface ProductoFormProps {
  categorias: Categoria[]
  initialValues?: ProductoFormValues
  modo: 'crear' | 'editar'
  submitting: boolean
  onSubmit: (values: ProductoFormValues) => Promise<void>
  onCancel: () => void
}

export function ProductoForm({
  categorias,
  initialValues,
  modo,
  submitting,
  onSubmit,
  onCancel,
}: ProductoFormProps) {
  const form = useForm({
    defaultValues: initialValues ?? {
      categoria_id: categorias[0]?.id ?? 0,
      nombre: '',
      descripcion: '',
      precio_base: 0,
      imagen_url: '',
      stock: 0,
      disponible: true,
    },

    onSubmit: async ({ value }) => {
      await onSubmit({
        ...value,
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
        imagen_url: value.imagen_url.trim(),
      })
    },
  })

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <form.Field
          name="nombre"
          validators={{
            onSubmit: ({ value }) =>
              value.trim().length === 0
                ? 'El nombre del producto es obligatorio'
                : undefined,
          }}
        >
          {(field) => (
            <div>
              <label
                htmlFor={field.name}
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Nombre
              </label>

              <input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) =>
                  field.handleChange(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

              {field.state.meta.errors.map((message, index) => (
                <p key={index} className="mt-1 text-sm text-red-600">
                  {String(message)}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field
          name="categoria_id"
          validators={{
            onSubmit: ({ value }) =>
              value > 0
                ? undefined
                : 'Seleccioná una categoría',
          }}
        >
          {(field) => (
            <div>
              <label
                htmlFor={field.name}
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Categoría
              </label>

              <select
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) =>
                  field.handleChange(Number(event.target.value))
                }
                disabled={categorias.length === 0}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:opacity-50"
              >
                <option value={0}>Seleccionar categoría</option>

                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>

              {field.state.meta.errors.map((message, index) => (
                <p key={index} className="mt-1 text-sm text-red-600">
                  {String(message)}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field
          name="precio_base"
          validators={{
            onSubmit: ({ value }) =>
              Number.isFinite(value) && value >= 0
                ? undefined
                : 'El precio debe ser un número mayor o igual a cero',
          }}
        >
          {(field) => (
            <div>
              <label
                htmlFor={field.name}
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Precio base
              </label>

              <input
                id={field.name}
                type="number"
                min="0"
                step="0.01"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) =>
                  field.handleChange(
                    event.target.value === ''
                      ? 0
                      : Number(event.target.value),
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

              {field.state.meta.errors.map((message, index) => (
                <p key={index} className="mt-1 text-sm text-red-600">
                  {String(message)}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        {modo === 'crear' && (
          <form.Field
            name="stock"
            validators={{
              onSubmit: ({ value }) =>
                Number.isInteger(value) && value >= 0
                  ? undefined
                  : 'El stock debe ser un entero mayor o igual a cero',
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Stock inicial
                </label>

                <input
                  id={field.name}
                  type="number"
                  min="0"
                  step="1"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(
                      event.target.value === ''
                        ? 0
                        : Number(event.target.value),
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

                {field.state.meta.errors.map((message, index) => (
                  <p key={index} className="mt-1 text-sm text-red-600">
                    {String(message)}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        )}
      </div>

      <form.Field name="descripcion">
        {(field) => (
          <div>
            <label
              htmlFor={field.name}
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Descripción (opcional)
            </label>

            <textarea
              id={field.name}
              rows={3}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) =>
                field.handleChange(event.target.value)
              }
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="imagen_url">
        {(field) => (
          <div>
            <label
              htmlFor={field.name}
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              URL de imagen (opcional)
            </label>

            <input
              id={field.name}
              type="url"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) =>
                field.handleChange(event.target.value)
              }
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        )}
      </form.Field>

      {modo === 'crear' && (
        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(event) =>
                  field.handleChange(event.target.checked)
                }
                className="h-4 w-4 accent-orange-600"
              />
              Producto disponible para la venta
            </label>
          )}
        </form.Field>
      )}

      <form.Subscribe selector={(state) => [state.isSubmitting]}>
        {([isSubmitting]) => (
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              disabled={submitting || isSubmitting}
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={submitting || isSubmitting || categorias.length === 0}
              className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting || isSubmitting
                ? 'Guardando...'
                : modo === 'crear'
                  ? 'Crear producto'
                  : 'Guardar cambios'}
            </button>
          </div>
        )}
      </form.Subscribe>
    </form>
  )
}