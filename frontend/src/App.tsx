function App() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
            Food Store
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Gestión de pedidos de comida
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Plataforma de gestión de productos, categorías y pedidos.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
            Frontend inicializado
          </span>

          <h2 className="mt-5 text-2xl font-semibold">
            Entorno de desarrollo preparado
          </h2>

          <p className="mt-3 leading-relaxed text-slate-600">
            React, TypeScript y Tailwind CSS están integrados.
            Ya podemos comenzar a construir las funcionalidades de Food Store.
          </p>
        </section>
      </div>
    </main>
  )
}

export default App