import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function EnvironmentBanner() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  return (
    <Alert className="border-warning bg-warning/10 mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <strong>Development Mode:</strong> Dashboard is configured to connect to API at{' '}
        <code className="px-1 py-0.5 bg-warning/20 rounded text-xs">{apiUrl}</code>
        . Make sure your API server is running.
      </AlertDescription>
    </Alert>
  );
}