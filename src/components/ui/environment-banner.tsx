import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { API_CONFIG } from '@/config/api';

export function EnvironmentBanner() {
  const apiUrl = API_CONFIG.baseURL;
  
  return (
    <Alert className="border-primary/20 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 mb-8 rounded-xl border-0 shadow-elevated">
      <div className="p-2 bg-primary/10 rounded-lg">
        <AlertCircle className="h-5 w-5 text-primary" />
      </div>
      <AlertDescription className="text-foreground">
        <strong className="font-semibold">Development Mode:</strong> Dashboard is configured to connect to API at{' '}
        <code className="px-2 py-1 bg-primary/10 rounded-lg text-sm font-mono text-primary border border-primary/20">{apiUrl}</code>
        . Make sure your API server is running.
      </AlertDescription>
    </Alert>
  );
}