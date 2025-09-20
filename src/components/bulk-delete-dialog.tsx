import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { AlertTriangle } from 'lucide-react';
import { DeleteMultipleStockRequest } from '@/types/dashboard';

interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DeleteMultipleStockRequest) => Promise<void>;
  isLoading?: boolean;
  totalStockCount: number;
}

export function BulkDeleteDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  totalStockCount,
}: BulkDeleteDialogProps) {
  const [deleteType, setDeleteType] = useState<'indexes' | 'first' | 'last' | 'all'>('first');
  const [stockIndexes, setStockIndexes] = useState<string>('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload: DeleteMultipleStockRequest = {
        deleteType,
        notes: notes.trim() || undefined,
      };

      if (deleteType === 'indexes') {
        const indexes = stockIndexes
          .split(',')
          .map(s => parseInt(s.trim()))
          .filter(n => !isNaN(n) && n >= 0 && n < totalStockCount);
        
        if (indexes.length === 0) {
          alert('Please enter valid stock indexes (0 to ' + (totalStockCount - 1) + ')');
          return;
        }
        payload.stockIndexes = indexes;
      }

      await onSubmit(payload);
      onOpenChange(false);
      
      // Reset form
      setDeleteType('first');
      setStockIndexes('');
      setNotes('');
    } catch (error) {
      console.error('Failed to delete stock:', error);
    }
  };

  const getDescription = () => {
    switch (deleteType) {
      case 'indexes':
        return 'Delete specific stock items by their index numbers (0-based, comma separated)';
      case 'first':
        return 'Delete the first stock item';
      case 'last':
        return 'Delete the last stock item';
      case 'all':
        return 'Delete ALL stock items - this action cannot be undone!';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Stock Items
          </DialogTitle>
          <DialogDescription>
            Choose how you want to delete stock items. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Delete Type</Label>
            <RadioGroup value={deleteType} onValueChange={(value) => setDeleteType(value as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="first" id="first" />
                <Label htmlFor="first">First item</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="last" id="last" />
                <Label htmlFor="last">Last item</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="indexes" id="indexes" />
                <Label htmlFor="indexes">Specific indexes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="text-red-600 font-medium">All items</Label>
              </div>
            </RadioGroup>
          </div>

          {deleteType === 'indexes' && (
            <div>
              <Label htmlFor="indexes-input">Stock Indexes (comma separated)</Label>
              <Input
                id="indexes-input"
                value={stockIndexes}
                onChange={(e) => setStockIndexes(e.target.value)}
                placeholder="0, 2, 4"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Valid range: 0 to {totalStockCount - 1}
              </p>
            </div>
          )}

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">{getDescription()}</p>
          </div>

          <div>
            <Label htmlFor="delete-notes">Notes</Label>
            <Textarea
              id="delete-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional reason for deletion"
              rows={2}
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
            <Button 
              type="submit" 
              variant={deleteType === 'all' ? 'destructive' : 'default'}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : `Delete ${deleteType === 'all' ? 'All' : 'Selected'}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 