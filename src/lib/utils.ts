import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateString: string, format: 'short' | 'long' = 'short'): string {
  const date = new Date(dateString);
  
  if (format === 'short') {
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// Helper functions to prevent "unknown" values
export function formatPaymentMethod(method: string): string {
  if (!method || method === 'unknown' || method === 'undefined' || method === 'null' || method === '') {
    return 'Not specified';
  }
  return method;
}

export function formatUserName(user: string): string {
  if (!user || user === 'unknown' || user === 'undefined' || user === 'null' || user === '') {
    return 'Anonymous User';
  }
  return user;
}

// Enhanced functions that handle both old and new field names
export function getTransactionUserName(transaction: any): string {
  // Try new field first, then fallback to old field
  const userName = transaction.user_name || transaction.user;
  return formatUserName(userName);
}

export function getTransactionPaymentMethod(transaction: any): string {
  // Try new field first, then fallback to old field
  const paymentMethod = transaction.payment_method || transaction.metodeBayar;
  return formatPaymentMethod(paymentMethod);
}

export function getTransactionReferenceId(transaction: any): string {
  // Try new field first (order_id), then fallback to old field (reffId)
  const referenceId = transaction.order_id || transaction.reffId;
  if (!referenceId || referenceId === 'unknown' || referenceId === 'undefined' || referenceId === 'null' || referenceId === '') {
    return 'N/A';
  }
  return referenceId;
}

export function getPaymentMethodBadge(method: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (!method || method === 'unknown' || method === 'undefined' || method === 'null' || method === '') {
    return 'outline';
  }
  
  const colors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'DANA': 'default',
    'OVO': 'secondary',
    'GOPAY': 'outline',
    'QRIS': 'destructive',
    'SALDO': 'default',
    'CASH': 'secondary',
    'BANK_TRANSFER': 'outline',
    'CREDIT_CARD': 'destructive',
    'DEBIT_CARD': 'outline',
    'E_WALLET': 'secondary',
    'BANK': 'outline',
    'TRANSFER': 'outline',
  };
  return colors[method] || 'secondary';
}

// Validate API response
export function validateApiResponse<T>(response: any): response is { success: true; data: T } {
  return response && 
         typeof response === 'object' && 
         response.success === true && 
         response.data !== undefined;
}

// Safe number conversion
export function safeNumber(value: any, defaultValue: number = 0): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

// Safe string conversion
export function safeString(value: any, defaultValue: string = ''): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return defaultValue;
  return String(value);
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
