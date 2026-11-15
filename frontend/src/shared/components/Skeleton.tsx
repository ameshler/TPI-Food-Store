interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
    />
  )
}

export function ProductGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-label="Cargando productos"
      role="status"
    >
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className="rounded-xl border border-slate-200 bg-white p-4"
        >
          <Skeleton className="h-40 w-full" />
          <Skeleton className="mt-4 h-5 w-3/4" />
          <Skeleton className="mt-3 h-4 w-1/2" />
          <Skeleton className="mt-5 h-8 w-1/3" />
          <Skeleton className="mt-4 h-10 w-full" />
        </div>
      ))}
      <span className="sr-only">Cargando productos...</span>
    </div>
  )
}