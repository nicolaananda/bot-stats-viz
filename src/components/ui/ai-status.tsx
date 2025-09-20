import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Settings, Key } from 'lucide-react';

interface AIStatusProps {
  hasAPIKey: boolean;
  isConnected: boolean;
  isLoading?: boolean;
  onConfigure?: () => void;
}

export function AIStatus({ hasAPIKey, isConnected, isLoading, onConfigure }: AIStatusProps) {
  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <CardTitle className="text-sm">Checking AI Status...</CardTitle>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={`border-dashed ${hasAPIKey && isConnected ? 'border-green-200' : 'border-orange-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {hasAPIKey && isConnected ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-orange-600" />
            )}
            <CardTitle className="text-sm">AI Integration Status</CardTitle>
          </div>
          <Badge 
            variant={hasAPIKey && isConnected ? "default" : "secondary"}
            className={hasAPIKey && isConnected ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
          >
            {hasAPIKey && isConnected ? "Connected" : "Not Configured"}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {hasAPIKey && isConnected 
            ? "OpenAI API is connected and ready to generate insights"
            : "Configure OpenAI API to enable AI-powered insights"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center space-x-2">
              <Key className="h-3 w-3" />
              <span>API Key</span>
            </span>
            <Badge variant={hasAPIKey ? "default" : "secondary"} className="text-xs">
              {hasAPIKey ? "Configured" : "Missing"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center space-x-2">
              <Settings className="h-3 w-3" />
              <span>Connection</span>
            </span>
            <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
              {isConnected ? "Active" : "Inactive"}
            </Badge>
          </div>

          {(!hasAPIKey || !isConnected) && onConfigure && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onConfigure}
              className="w-full mt-2"
            >
              Configure AI Integration
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 