import { Skeleton } from "@/components/ui/skeleton";

export default function OrderConfirmationLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl text-center">
        {/* Check icon placeholder */}
        <div className="mb-6 flex justify-center">
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>

        {/* Title and subtitle */}
        <Skeleton className="mx-auto mb-2 h-8 w-64" />
        <Skeleton className="mx-auto mb-8 h-4 w-48" />

        {/* Order details card */}
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}
