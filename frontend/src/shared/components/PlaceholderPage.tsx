interface PlaceholderPageProps {
  title: string
  description: string
}

export function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12">
      <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
          Food Store
        </p>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          {title}
        </h1>

        <p className="mt-3 text-slate-600">
          {description}
        </p>
      </section>
    </main>
  )
}