import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button skeleton */}
      <Skeleton className="mb-6 h-9 w-24" />

      {/* Two-column layout */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Image skeleton */}
        <Skeleton className="aspect-square rounded-lg" />

        {/* Details skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="mt-6 h-11 w-full" />
        </div>
      </div>
    </div>
  );
}
