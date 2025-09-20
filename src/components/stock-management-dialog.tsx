import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { StockItem } from "@/types/dashboard";

interface StockManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  title: string;
  initialData?: StockItem;
  onSubmit: (data: { stockItems?: StockItem[]; stockItem?: StockItem; notes?: string }) => Promise<void>;
  isLoading?: boolean;
}

export function StockManagementDialog({
  open,
  onOpenChange,
  mode,
  title,
  initialData,
  onSubmit,
  isLoading = false,
}: StockManagementDialogProps) {
  const [stockItems, setStockItems] = useState<StockItem[]>([
    { email: "", password: "", profile: "", pin: "", notes: "" }
  ]);
  const [globalNotes, setGlobalNotes] = useState("");

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setStockItems([initialData]);
    } else if (mode === "add") {
      setStockItems([{ email: "", password: "", profile: "", pin: "", notes: "" }]);
    }
    setGlobalNotes("");
  }, [mode, initialData, open]);

  const addStockItem = () => {
    setStockItems([...stockItems, { email: "", password: "", profile: "", pin: "", notes: "" }]);
  };

  const removeStockItem = (index: number) => {
    if (stockItems.length > 1) {
      setStockItems(stockItems.filter((_, i) => i !== index));
    }
  };

  const updateStockItem = (index: number, field: keyof StockItem, value: string) => {
    const updatedItems = stockItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setStockItems(updatedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === "add") {
        await onSubmit({ stockItems, notes: globalNotes });
      } else {
        await onSubmit({ stockItem: stockItems[0], notes: globalNotes });
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit stock data:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === "add" 
              ? "Add new stock items to this product. Email and password are required fields."
              : "Edit the stock item details. Email and password are required fields."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {stockItems.map((item, index) => (
            <div key={index} className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Stock Item {index + 1}
                </Label>
                {mode === "add" && stockItems.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStockItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`email-${index}`}>Email *</Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    value={item.email}
                    onChange={(e) => updateStockItem(index, "email", e.target.value)}
                    placeholder="user@example.com"
                    required
                    autoComplete="off"
                    data-form-type="other"
                    data-lpignore="true"
                  />
                </div>
                <div>
                  <Label htmlFor={`password-${index}`}>Password *</Label>
                  <Input
                    id={`password-${index}`}
                    type="text"
                    value={item.password}
                    onChange={(e) => updateStockItem(index, "password", e.target.value)}
                    placeholder="password123"
                    required
                    autoComplete="off"
                    data-form-type="other"
                    data-lpignore="true"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`profile-${index}`}>Profile</Label>
                  <Input
                    id={`profile-${index}`}
                    value={item.profile || ""}
                    onChange={(e) => updateStockItem(index, "profile", e.target.value)}
                    placeholder="profile1"
                    autoComplete="off"
                    data-form-type="other"
                    data-lpignore="true"
                  />
                </div>
                <div>
                  <Label htmlFor={`pin-${index}`}>PIN</Label>
                  <Input
                    id={`pin-${index}`}
                    value={item.pin || ""}
                    onChange={(e) => updateStockItem(index, "pin", e.target.value)}
                    placeholder="1234"
                    autoComplete="off"
                    data-form-type="other"
                    data-lpignore="true"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor={`notes-${index}`}>Notes</Label>
                <Textarea
                  id={`notes-${index}`}
                  value={item.notes || ""}
                  onChange={(e) => updateStockItem(index, "notes", e.target.value)}
                  placeholder="Optional notes for this stock item"
                  rows={2}
                  autoComplete="off"
                  data-form-type="other"
                  data-lpignore="true"
                />
              </div>
            </div>
          ))}

          {mode === "add" && (
            <Button
              type="button"
              variant="outline"
              onClick={addStockItem}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Stock Item
            </Button>
          )}

          <div>
            <Label htmlFor="global-notes">Global Notes</Label>
            <Textarea
              id="global-notes"
              value={globalNotes}
              onChange={(e) => setGlobalNotes(e.target.value)}
              placeholder="Notes for this operation"
              rows={2}
              autoComplete="off"
              data-form-type="other"
              data-lpignore="true"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : mode === "add" ? "Add Stock" : "Update Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
