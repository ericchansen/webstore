"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateStock } from "@/lib/admin/actions";
import { Check } from "lucide-react";

export function StockUpdateForm({
  productId,
  currentStock,
}: {
  productId: string;
  currentStock: number;
}) {
  const [stock, setStock] = useState(currentStock);
  const [isPending, startTransition] = useTransition();
  const hasChanged = stock !== currentStock;

  const handleUpdate = () => {
    if (!hasChanged) return;
    startTransition(async () => {
      await updateStock(productId, stock);
    });
  };

  return (
    <div className="flex items-center gap-2 justify-end">
      <Input
        type="number"
        min="0"
        value={stock}
        onChange={(e) => setStock(parseInt(e.target.value) || 0)}
        className="w-20 text-right"
      />
      {hasChanged && (
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={handleUpdate}
          disabled={isPending}
        >
          <Check className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
