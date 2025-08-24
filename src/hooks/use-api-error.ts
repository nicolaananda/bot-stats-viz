import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

interface ApiError {
  message?: string;
  error?: string;
  status?: number;
}

export function useApiError() {
  const { toast } = useToast();

  const handleError = useCallback((error: any, context?: string) => {
    let errorMessage = 'An unexpected error occurred';
    let errorTitle = 'Error';

    if (error?.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    if (context) {
      errorTitle = `${context} Error`;
    }

    // Handle specific HTTP status codes
    if (error?.response?.status) {
      switch (error.response.status) {
        case 400:
          errorTitle = 'Bad Request';
          break;
        case 401:
          errorTitle = 'Unauthorized';
          break;
        case 403:
          errorTitle = 'Forbidden';
          break;
        case 404:
          errorTitle = 'Not Found';
          break;
        case 500:
          errorTitle = 'Server Error';
          break;
        case 503:
          errorTitle = 'Service Unavailable';
          break;
        default:
          errorTitle = 'Request Failed';
      }
    }

    // Network errors
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
      errorTitle = 'Connection Error';
      errorMessage = 'Unable to connect to the server. Please check your internet connection.';
    }

    // Timeout errors
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      errorTitle = 'Request Timeout';
      errorMessage = 'The request took too long to complete. Please try again.';
    }

    toast({
      title: errorTitle,
      description: errorMessage,
      variant: 'destructive',
    });

    // Log error for debugging
    console.error(`API Error [${context || 'Unknown'}]:`, error);
  }, [toast]);

  const handleSuccess = useCallback((message: string, title: string = 'Success') => {
    toast({
      title,
      description: message,
    });
  }, [toast]);

  return {
    handleError,
    handleSuccess,
  };
} 