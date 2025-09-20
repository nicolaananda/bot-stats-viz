import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Bug, Database } from 'lucide-react';

interface DebugPanelProps {
  title: string;
  data: any;
  isVisible?: boolean;
}

export function DebugPanel({ title, data, isVisible = false }: DebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  return (
    <Card className="border-dashed border-orange-200 bg-orange-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bug className="h-4 w-4 text-orange-600" />
            <CardTitle className="text-sm text-orange-800">Debug Panel: {title}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Development Only
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 px-2"
            >
              {isExpanded ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        <CardDescription className="text-xs text-orange-700">
          Raw backend data for troubleshooting - remove in production
        </CardDescription>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs">
              <Database className="h-3 w-3" />
              <span className="font-medium">Data Type:</span>
              <Badge variant="secondary" className="text-xs">
                {Array.isArray(data) ? 'Array' : typeof data}
              </Badge>
              {Array.isArray(data) && (
                <Badge variant="secondary" className="text-xs">
                  Length: {data.length}
                </Badge>
              )}
            </div>
            
            <div className="bg-white rounded-lg p-3 border">
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
            
            {Array.isArray(data) && data.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-orange-800">Sample Data Structure:</h5>
                <div className="bg-white rounded-lg p-3 border">
                  <pre className="text-xs overflow-auto max-h-40">
                    {JSON.stringify(data[0], null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
} 