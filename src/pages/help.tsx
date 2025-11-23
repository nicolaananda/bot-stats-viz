import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, BookOpen, MessageCircle, Mail, Phone, ExternalLink, Bot, CreditCard, Settings, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function HelpPage() {
  const helpTopics = [
    { title: 'Getting Started', description: 'Learn how to set up your WhatsApp bot', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Bot Configuration', description: 'Configure bot behavior and responses', icon: Bot, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Transaction Management', description: 'Manage payments and transactions', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'WhatsApp Integration', description: 'Connect your bot to WhatsApp', icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Settings & Preferences', description: 'Customize bot settings', icon: Settings, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Troubleshooting', description: 'Common issues and solutions', icon: HelpCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  const contactMethods = [
    { title: 'Email Support', description: 'Get help via email', icon: Mail, action: 'mailto:support@whatsappbot.com', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Live Chat', description: 'Chat with our support team', icon: MessageCircle, action: '#', color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Phone Support', description: 'Call us for immediate help', icon: Phone, action: 'tel:+6281234567890', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Help & Support</h1>
          <p className="text-muted-foreground mt-1">Find answers and get help with your WhatsApp Bot</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for help articles..."
            className="pl-10 bg-background/50 border-border/50 focus:bg-background transition-all"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Quick Help */}
          <Card className="card-premium border-none shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Knowledge Base
              </CardTitle>
              <CardDescription>Browse topics to find what you need</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {helpTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="group p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-primary/20 transition-all cursor-pointer flex items-start gap-4"
                  >
                    <div className={cn("p-3 rounded-xl transition-colors group-hover:scale-110 duration-300", topic.bg)}>
                      <topic.icon className={cn("h-6 w-6", topic.color)} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{topic.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{topic.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="card-premium border-none shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-orange-500" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Common questions about WhatsApp Bot</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { q: 'How do I connect my WhatsApp bot?', a: 'Go to Settings > WhatsApp Integration and follow the setup wizard to connect your bot to WhatsApp Business API.' },
                  { q: 'How do I configure auto-replies?', a: 'Navigate to Settings > Bot Configuration and enable Auto Reply. You can customize the response messages in the message settings.' },
                  { q: 'How do I track transactions?', a: 'All transactions are automatically tracked in the Dashboard. You can view detailed reports in the Reports section.' },
                  { q: 'How do I set up payment notifications?', a: 'Enable Payment Notifications in Settings > Bot Configuration. Users will receive automatic updates about their payment status.' },
                  { q: 'How do I export transaction data?', a: 'Go to Settings > System Settings and click Export to download your transaction data in CSV format.' },
                  { q: 'How do I troubleshoot bot issues?', a: 'Check the bot status in Settings > WhatsApp Integration. Enable Debug Mode for detailed logging and contact support if issues persist.' },
                ].map((faq, index) => (
                  <div key={index} className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">Q</span>
                      {faq.q}
                    </h3>
                    <p className="text-sm text-muted-foreground pl-8">{faq.a}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Bot Status */}
          <Card className="card-premium border-none shadow-soft bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-400" />
                System Status
              </CardTitle>
              <CardDescription className="text-slate-400">Current bot health check</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <span className="font-medium text-sm">Bot Core</span>
                </div>
                <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Operational</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-sm">WhatsApp API</span>
                </div>
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>
                  <span className="font-medium text-sm">Webhook</span>
                </div>
                <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">Active</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="card-premium border-none shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Contact Support
              </CardTitle>
              <CardDescription>Need personal assistance?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactMethods.map((method, index) => (
                <div key={index} className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors text-center group">
                  <div className={cn("w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110", method.bg)}>
                    <method.icon className={cn("h-6 w-6", method.color)} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{method.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{method.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-primary/20 hover:bg-primary/5 hover:text-primary"
                    onClick={() => window.open(method.action, '_blank')}
                  >
                    Connect
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Activity({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
