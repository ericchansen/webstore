import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Package } from "lucide-react";
import { getInventory } from "@/lib/admin/queries";
import { StockUpdateForm } from "@/components/admin/stock-update-form";

export default async function InventoryPage() {
  const inventory = await getInventory();

  const outOfStock = inventory.filter((p) => p.status === "out_of_stock");
  const lowStock = inventory.filter((p) => p.status === "low_stock");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory</h1>
        <p className="text-muted-foreground">
          Monitor and manage stock levels
        </p>
      </div>

      {/* Alerts */}
      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <div className="space-y-4">
          {outOfStock.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Out of Stock</AlertTitle>
              <AlertDescription>
                {outOfStock.length} products are out of stock and unavailable
                for purchase.
              </AlertDescription>
            </Alert>
          )}
          {lowStock.length > 0 && (
            <Alert>
              <Package className="h-4 w-4" />
              <AlertTitle>Low Stock Warning</AlertTitle>
              <AlertDescription>
                {lowStock.length} products have low stock (10 or fewer units).
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
          <CardDescription>
            {inventory.length} products tracked
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inventory.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No products in inventory. Add products to track stock.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Update Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.category.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === "out_of_stock"
                            ? "destructive"
                            : product.status === "low_stock"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {product.status === "out_of_stock"
                          ? "Out of Stock"
                          : product.status === "low_stock"
                            ? "Low Stock"
                            : "In Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {product.stockCount}
                    </TableCell>
                    <TableCell className="text-right">
                      <StockUpdateForm
                        productId={product.id}
                        currentStock={product.stockCount}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
