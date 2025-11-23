import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, User, Bell, Shield, Palette, Database, Bot, MessageSquare, Phone, Save, RefreshCw, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your WhatsApp Bot preferences and system configurations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-background/50 backdrop-blur-sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Defaults
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="bot" className="space-y-6">
        <TabsList className="bg-background/50 backdrop-blur-sm p-1 border border-border/50 rounded-xl">
          <TabsTrigger value="bot" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Bot Config</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Notifications</TabsTrigger>
          <TabsTrigger value="system" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">System</TabsTrigger>
        </TabsList>

        <TabsContent value="bot" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-premium border-none shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-500" />
                  Bot Configuration
                </CardTitle>
                <CardDescription>Configure your WhatsApp bot behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto Reply</Label>
                    <p className="text-sm text-muted-foreground">Enable automatic responses to incoming messages</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Welcome Message</Label>
                    <p className="text-sm text-muted-foreground">Send a greeting to new users</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Payment Notifications</Label>
                    <p className="text-sm text-muted-foreground">Notify users about payment status updates</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card className="card-premium border-none shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-emerald-500" />
                  Message Settings
                </CardTitle>
                <CardDescription>Configure message handling and protection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Message Logging</Label>
                    <p className="text-sm text-muted-foreground">Log all bot conversations for auditing</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Spam Protection</Label>
                    <p className="text-sm text-muted-foreground">Automatically block spam messages</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">Limit message frequency per user</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card className="card-premium border-none shadow-soft md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-purple-500" />
                  WhatsApp Integration
                </CardTitle>
                <CardDescription>WhatsApp API connection settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <div className="flex gap-2">
                      <Input defaultValue="https://api.example.com/webhook" className="bg-muted/30" />
                      <Button variant="outline">Test</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number ID</Label>
                    <Input defaultValue="109238475610239" className="bg-muted/30" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>API Token</Label>
                    <div className="flex gap-2">
                      <Input type="password" value="********************************" className="bg-muted/30 font-mono" readOnly />
                      <Button variant="outline">Regenerate</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="card-premium border-none shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Manage how and when you receive alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">New Transaction Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for every new transaction</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Error Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get alerted immediately when bot errors occur</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Daily Reports</Label>
                  <p className="text-sm text-muted-foreground">Receive a daily summary of bot performance</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card className="card-premium border-none shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-rose-500" />
                System Settings
              </CardTitle>
              <CardDescription>Advanced system configuration and maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Data Backup</Label>
                      <p className="text-sm text-muted-foreground">Automatically backup transaction data daily</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Debug Mode</Label>
                      <p className="text-sm text-muted-foreground">Enable verbose logging for troubleshooting</p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      Maintenance Actions
                    </h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start hover:bg-muted">
                        <Download className="mr-2 h-4 w-4" />
                        Export All Data
                      </Button>
                      <Button variant="outline" className="w-full justify-start hover:bg-muted">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Clear System Cache
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Purge Old Logs
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
