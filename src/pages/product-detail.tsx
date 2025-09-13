import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Package, Plus, Trash2, Edit, MoreHorizontal, ArrowLeft } from "lucide-react";
import { dashboardApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { StockManagementDialog } from "@/components/stock-management-dialog";
import { BulkDeleteDialog } from "@/components/bulk-delete-dialog";

interface EditingStock {
  index: number;
  data: {
    email: string;
    password: string;
    profile: string;
    pin: string;
    notes: string;
  };
}

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [addStockOpen, setAddStockOpen] = useState(false);
  const [editStockOpen, setEditStockOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<EditingStock | null>(null);

  // Fetch product details - FIXED: Use correct API function
  const { data: details, isLoading, error } = useQuery({
    queryKey: ["product-details", productId],
    queryFn: () => dashboardApi.getProductStockDetails(productId!),
    enabled: !!productId,
  });

  const stockItems = details?.stock?.items || [];
  const totalStockCount = details?.stock?.count || 0;

  // Mutations
  const addStockMutation = useMutation({
    mutationFn: (data: any) => dashboardApi.addStock(productId!, data),
    onSuccess: (result) => {
      console.log("✅ Add stock success:", result);
      toast({
        title: "Stock Added Successfully",
        description: `Added ${result.addedItems || 1} stock items to ${result.productName}`,
      });
      // Force refresh the query
      queryClient.invalidateQueries({ queryKey: ["product-details", productId] });
      queryClient.refetchQueries({ queryKey: ["product-details", productId] });
    },
    onError: (error: any) => {
      console.error("❌ Add stock error:", error);
      toast({
        title: "Failed to Add Stock",
        description: error.message || "An error occurred while adding stock",
        variant: "destructive",
      });
    },
  });

  const editStockMutation = useMutation({
    mutationFn: ({ index, data }: { index: number; data: any }) => 
      dashboardApi.editStock(productId!, index, data),
    onSuccess: (result) => {
      console.log("✅ Edit stock success:", result);
      toast({
        title: "Stock Updated Successfully",
        description: `Updated stock item at index ${result.stockIndex}`,
      });
      // Force refresh the query
      queryClient.invalidateQueries({ queryKey: ["product-details", productId] });
      queryClient.refetchQueries({ queryKey: ["product-details", productId] });
    },
    onError: (error: any) => {
      console.error("❌ Edit stock error:", error);
      toast({
        title: "Failed to Update Stock",
        description: error.message || "An error occurred while updating stock",
        variant: "destructive",
      });
    },
  });

  const deleteStockMutation = useMutation({
    mutationFn: (index: number) => dashboardApi.deleteStock(productId!, index),
    onSuccess: (result) => {
      console.log("✅ Delete stock success:", result);
      toast({
        title: "Stock Deleted Successfully",
        description: `Deleted stock item from ${result.productName}`,
      });
      // Force refresh the query
      queryClient.invalidateQueries({ queryKey: ["product-details", productId] });
      queryClient.refetchQueries({ queryKey: ["product-details", productId] });
    },
    onError: (error: any) => {
      console.error("❌ Delete stock error:", error);
      toast({
        title: "Failed to Delete Stock",
        description: error.message || "An error occurred while deleting stock",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (data: any) => dashboardApi.deleteMultipleStock(productId!, data),
    onSuccess: (result) => {
      console.log("✅ Bulk delete success:", result);
      toast({
        title: "Stock Deleted Successfully",
        description: `Deleted ${result.deletedItemsCount || 1} stock items from ${result.productName}`,
      });
      // Force refresh the query
      queryClient.invalidateQueries({ queryKey: ["product-details", productId] });
      queryClient.refetchQueries({ queryKey: ["product-details", productId] });
    },
    onError: (error: any) => {
      console.error("❌ Bulk delete error:", error);
      toast({
        title: "Failed to Delete Stock",
        description: error.message || "An error occurred while deleting stock",
        variant: "destructive",
      });
    },
  });

  // Handler functions
  const handleAddStock = async (data: any) => {
    console.log("🔍 Adding stock:", data);
    try {
      await addStockMutation.mutateAsync(data);
    } catch (error) {
      console.error("❌ Add stock failed:", error);
    }
  };

  const handleEditStock = (index: number) => {
    const stockItem = details?.stock?.items?.[index];
    if (stockItem?.parsed) {
      setEditingStock({
        index,
        data: {
          email: stockItem.parsed.email || "",
          password: stockItem.parsed.password || "",
          profile: stockItem.parsed.profile || "",
          pin: stockItem.parsed.pin || "",
          notes: stockItem.parsed.notes || "",
        }
      });
      setEditStockOpen(true);
    }
  };

  const handleUpdateStock = async (data: any) => {
    console.log("🔍 Updating stock:", data);
    if (editingStock) {
      try {
        await editStockMutation.mutateAsync({ index: editingStock.index, data });
        setEditingStock(null);
      } catch (error) {
        console.error("❌ Update stock failed:", error);
      }
    }
  };

  const handleDeleteStock = async (index: number) => {
    if (confirm("Are you sure you want to delete this stock item?")) {
      console.log("🔍 Deleting stock at index:", index);
      try {
        await deleteStockMutation.mutateAsync(index);
      } catch (error) {
        console.error("❌ Delete stock failed:", error);
      }
    }
  };

  const handleBulkDelete = async (data: any) => {
    console.log("🔍 Bulk deleting stock:", data);
    try {
      await bulkDeleteMutation.mutateAsync(data);
    } catch (error) {
      console.error("❌ Bulk delete failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading product details</p>
          <Button onClick={() => navigate("/products")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/products")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{details.productName}</h1>
            <p className="text-muted-foreground">{details.description}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          {details.category}
        </Badge>
      </div>

      {/* Product Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{details.sales?.total || 0}</div>
            <p className="text-sm text-muted-foreground">Total sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stock Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStockCount}</div>
            <p className="text-sm text-muted-foreground">
              {details.stock?.status === "good" ? "Good" : "Low stock"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Prices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {details.prices && Object.entries(details.prices).map(([tier, price]) => (
                <div key={tier} className="flex justify-between text-sm">
                  <span className="capitalize">{tier}:</span>
                  <span>Rp {Number(price).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Stock Management
              </CardTitle>
              <CardDescription>
                Manage stock items for this product. Total: {totalStockCount} items
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setAddStockOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Stock
              </Button>
              {totalStockCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setBulkDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Bulk Delete
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {totalStockCount === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No stock items available</p>
              <Button onClick={() => setAddStockOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Stock Item
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Index</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead>Profile</TableHead>
                    <TableHead>PIN</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockItems.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-sm">{idx}</TableCell>
                      <TableCell>{item.parsed?.email || "-"}</TableCell>
                      <TableCell className="font-mono">{item.parsed?.password || "-"}</TableCell>
                      <TableCell>{item.parsed?.profile || "-"}</TableCell>
                      <TableCell>{item.parsed?.pin || "-"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {item.parsed?.notes || "-"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditStock(idx)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteStock(idx)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <StockManagementDialog
        open={addStockOpen}
        onOpenChange={setAddStockOpen}
        mode="add"
        title="Add Stock Items"
        onSubmit={handleAddStock}
        isLoading={addStockMutation.isPending}
      />

      <StockManagementDialog
        open={editStockOpen}
        onOpenChange={setEditStockOpen}
        mode="edit"
        title="Edit Stock Item"
        initialData={editingStock?.data}
        onSubmit={handleUpdateStock}
        isLoading={editStockMutation.isPending}
      />

      <BulkDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        totalItems={totalStockCount}
        onSubmit={handleBulkDelete}
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  );
}
