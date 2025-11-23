import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Package, Plus, Trash2, Edit, MoreHorizontal, ArrowLeft, ShoppingCart, Tag, AlertCircle, CheckCircle2, Box } from "lucide-react";
import { dashboardApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { StockManagementDialog } from "@/components/stock-management-dialog";
import { BulkDeleteDialog } from "@/components/bulk-delete-dialog";
import { cn } from "@/lib/utils";

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

  // Fetch product details
  const { data: details, isLoading, error } = useQuery({
    queryKey: ["product-details", productId],
    queryFn: () => dashboardApi.getProductStockDetails(productId!),
    enabled: !!productId,
  });

  const stockItems = details?.stock?.items || [];
  const totalStockCount = details?.stock?.count || 0;

  // Mutations
  const addStockMutation = useMutation({
    mutationFn: (data: any) => {
      const items = (data?.stockItems ?? []).map((it: any) => {
        const sanitize = (v: string) => (v ?? '').toString().trim().replace(/\|/g, '/');
        const email = sanitize(it.email);
        const password = sanitize(it.password);
        const profile = sanitize(it.profile);
        const pin = sanitize(it.pin);
        const notes = sanitize(it.notes);
        if (!email || !password) {
          throw new Error('Email and password are required');
        }
        return [email, password, profile, pin, notes].join('|');
      });
      const notes = (data?.notes ?? '').toString();
      return dashboardApi.updateProductStock(productId!, { action: 'add', stockItems: items, notes });
    },
    onSuccess: (result) => {
      toast({
        title: "Stock Added Successfully",
        description: `New stock count: ${result.newStockCount}`,
      });
      queryClient.invalidateQueries({ queryKey: ["product-details", productId] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Stock",
        description: error.message || "An error occurred while adding stock",
        variant: "destructive",
      });
    },
  });

  const editStockMutation = useMutation({
    mutationFn: ({ index, data }: { index: number; data: any }) => {
      const item = data?.stockItem ?? data;
      const email = (item?.email ?? '').trim();
      const password = (item?.password ?? '').trim();
      const profile = (item?.profile ?? '').toString();
      const pin = (item?.pin ?? '').toString();
      const notes = (item?.notes ?? '').toString();

      if (!email || !password) {
        return Promise.reject(new Error('Email and password are required'));
      }

      const sanitize = (v: string) => v.replace(/\|/g, '/');
      const raw = [email, password, profile, pin, notes].map(sanitize).join('|');
      return dashboardApi.editStockItem(productId!, { index, value: raw });
    },
    onSuccess: () => {
      toast({
        title: "Stock Updated Successfully",
        description: `Stock item has been updated`,
      });
      queryClient.invalidateQueries({ queryKey: ["product-details", productId] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Stock",
        description: error.message || "An error occurred while updating stock",
        variant: "destructive",
      });
    },
  });

  const deleteStockMutation = useMutation({
    mutationFn: (index: number) => dashboardApi.deleteStockItem(productId!, { index }),
    onSuccess: () => {
      toast({
        title: "Stock Deleted Successfully",
        description: `Stock item has been deleted`,
      });
      queryClient.invalidateQueries({ queryKey: ["product-details", productId] });
    },
    onError: (error: any) => {
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
      toast({
        title: "Stock Deleted Successfully",
        description: `Deleted ${result.deletedItemsCount || 1} stock items from ${result.productName}`,
      });
      queryClient.invalidateQueries({ queryKey: ["product-details", productId] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete Stock",
        description: error.message || "An error occurred while deleting stock",
        variant: "destructive",
      });
    },
  });

  // Handler functions
  const handleAddStock = async (data: any) => {
    try {
      await addStockMutation.mutateAsync(data);
    } catch (error) {
      console.error("Add stock failed:", error);
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
    if (editingStock) {
      try {
        await editStockMutation.mutateAsync({ index: editingStock.index, data });
        setEditingStock(null);
      } catch (error) {
        console.error("Update stock failed:", error);
      }
    }
  };

  const handleDeleteStock = async (index: number) => {
    if (confirm("Are you sure you want to delete this stock item?")) {
      try {
        await deleteStockMutation.mutateAsync(index);
      } catch (error) {
        console.error("Delete stock failed:", error);
      }
    }
  };

  const handleBulkDelete = async (data: any) => {
    try {
      await bulkDeleteMutation.mutateAsync(data);
    } catch (error) {
      console.error("Bulk delete failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-destructive/5 rounded-2xl border border-destructive/20">
          <h3 className="text-lg font-bold text-destructive mb-2">Error loading product details</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Product ID: {productId}<br />
            Error: {error?.message || 'Product not found'}
          </p>
          <Button onClick={() => navigate('/products')} variant="outline">
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/products')}
              className="h-auto p-0 hover:bg-transparent hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Products
            </Button>
            <span>/</span>
            <span>Details</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{details.productName}</h1>
          <p className="text-muted-foreground mt-1">{details.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-background/50 backdrop-blur-sm px-3 py-1 text-sm font-medium">
            <Tag className="h-3.5 w-3.5 mr-1.5 text-primary" />
            {details.category}
          </Badge>
          <Badge
            variant={details.stock?.status === "good" ? "default" : "destructive"}
            className={cn(
              "px-3 py-1 text-sm font-medium",
              details.stock?.status === "good"
                ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20"
                : "bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20"
            )}
          >
            {details.stock?.status === "good" ? (
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
            )}
            {details.stock?.status === "good" ? "In Stock" : "Low Stock"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <Card className="card-premium border-none shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-foreground">{details.sales?.total || 0}</div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-none shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-foreground">{totalStockCount}</div>
              <div className={cn("p-2 rounded-lg", totalStockCount > 0 ? "bg-emerald-500/10" : "bg-red-500/10")}>
                <Package className={cn("h-5 w-5", totalStockCount > 0 ? "text-emerald-500" : "text-red-500")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-none shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pricing Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {details.prices && Object.entries(details.prices).map(([tier, price]) => (
                <div key={tier} className="flex justify-between text-sm items-center">
                  <span className="capitalize text-muted-foreground">{tier}</span>
                  <span className="font-medium text-foreground">Rp {Number(price).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Management */}
      <Card className="card-premium border-none shadow-soft">
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5 text-primary" />
                Stock Management
              </CardTitle>
              <CardDescription className="mt-1">
                Manage inventory items for this product. Total: {totalStockCount} items
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setAddStockOpen(true)} size="sm" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4 mr-2" />
                Add Stock
              </Button>
              {totalStockCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkDeleteOpen(true)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Bulk Delete
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {totalStockCount === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No stock items available</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                This product currently has no inventory. Add stock items to make it available for purchase.
              </p>
              <Button onClick={() => setAddStockOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Stock Item
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-[80px]">Index</TableHead>
                    <TableHead>Email / Account</TableHead>
                    <TableHead>Password / Key</TableHead>
                    <TableHead>Profile</TableHead>
                    <TableHead>PIN</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockItems.map((item, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/30 border-border/50 transition-colors">
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border">
                          #{idx}
                        </code>
                      </TableCell>
                      <TableCell className="font-medium">{item.parsed?.email || "-"}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                          {item.parsed?.password || "-"}
                        </code>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{item.parsed?.profile || "-"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{item.parsed?.pin || "-"}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                        {item.parsed?.notes || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => handleEditStock(idx)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteStock(idx)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
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
        totalStockCount={totalStockCount}
        onSubmit={handleBulkDelete}
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  );
}
