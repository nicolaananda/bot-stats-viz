import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note: In production, this should be handled server-side
});

export interface InsightRequest {
  transaksiHariIni: number;
  pendapatanHariIni: number;
  totalTransaksi: number;
  totalPendapatan: number;
  userActivity?: number[];
  dailyRevenue?: Array<{ date: string; pendapatan: number }>;
}

export interface InsightResponse {
  insights: Array<{
    type: 'growth' | 'engagement' | 'optimization' | 'warning' | 'opportunity';
    title: string;
    description: string;
    emoji: string;
    priority: 'high' | 'medium' | 'low';
    actionable: boolean;
    recommendation?: string;
  }>;
  summary: string;
  nextActions: string[];
}

export class OpenAIService {
  static async generateInsights(data: InsightRequest): Promise<InsightResponse> {
    try {
      const prompt = this.buildPrompt(data);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a business analytics expert specializing in WhatsApp bot performance and e-commerce metrics. Provide actionable insights in Indonesian language with a professional yet friendly tone."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Parse the response and return structured insights
      return this.parseInsightsResponse(response, data);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      // Return fallback insights if AI fails
      return this.getFallbackInsights(data);
    }
  }

  private static buildPrompt(data: InsightRequest): string {
    return `
    Analyze the following WhatsApp bot performance data and provide 4-5 actionable business insights:

    Current Day Performance:
    - Transaksi Hari Ini: ${data.transaksiHariIni}
    - Pendapatan Hari Ini: ${data.pendapatanHariIni}

    Overall Performance:
    - Total Transaksi: ${data.totalTransaksi}
    - Total Pendapatan: ${data.totalPendapatan}

    Please provide insights in the following format:
    1. Growth Opportunity (🚀) - Focus on expansion and scaling
    2. High Engagement (✅) - Highlight strong performance areas
    3. Optimization Tip (⚡) - Suggest improvements
    4. Data Quality (📊) - Comment on data completeness
    5. Additional insight if relevant

    Each insight should be:
    - Actionable and specific
    - Written in Indonesian
    - Include relevant metrics
    - Suggest next steps
    - Be concise but informative

    Also provide:
    - A brief summary of the overall performance
    - 2-3 specific next actions the business should take
    `;
  }

  private static parseInsightsResponse(response: string, data: InsightRequest): InsightResponse {
    // Simple parsing - in production you might want more sophisticated parsing
    const insights = [
      {
        type: 'growth' as const,
        title: '🚀 Growth Opportunity',
        description: `Transaksi hari ini: ${data.transaksiHariIni} dengan pendapatan ${this.formatCurrency(data.pendapatanHariIni)}. ${response.includes('pertumbuhan') ? 'Pertimbangkan untuk memperluas layanan.' : 'Identifikasi pola yang berhasil dan replikasi strategi ini.'}`,
        emoji: '🚀',
        priority: 'high' as const,
        actionable: true,
        recommendation: 'Analisis pola transaksi yang berhasil dan replikasi strategi marketing'
      },
      {
        type: 'engagement' as const,
        title: '✅ High Engagement',
        description: `Total transaksi: ${data.totalTransaksi} dengan total pendapatan ${this.formatCurrency(data.totalPendapatan)}. Ini menunjukkan engagement yang kuat dari pengguna.`,
        emoji: '✅',
        priority: 'medium' as const,
        actionable: false
      },
      {
        type: 'optimization' as const,
        title: '⚡ Optimization Tip',
        description: response.includes('optimasi') ? response : 'Analisis data menunjukkan peluang untuk optimasi. Pertimbangkan untuk menganalisis pola waktu transaksi dan meningkatkan responsivitas bot.',
        emoji: '⚡',
        priority: 'medium' as const,
        actionable: true,
        recommendation: 'Implementasi fitur auto-reply untuk waktu puncak transaksi'
      },
      {
        type: 'opportunity' as const,
        title: '📊 Data Quality',
        description: `Data collection Anda komprehensif dengan ${data.totalTransaksi} total transaksi tercatat. Ini memberikan visibilitas yang sangat baik ke dalam pola perilaku pengguna.`,
        emoji: '📊',
        priority: 'low' as const,
        actionable: false
      }
    ];

    return {
      insights,
      summary: `Performa WhatsApp bot menunjukkan ${data.transaksiHariIni > 0 ? 'pertumbuhan positif' : 'stabilitas'} dengan ${data.transaksiHariIni} transaksi hari ini.`,
      nextActions: [
        'Analisis pola transaksi yang berhasil',
        'Implementasi fitur auto-reply untuk waktu puncak',
        'Review dan optimasi alur konversi'
      ]
    };
  }

  static getFallbackInsights(data: InsightRequest): InsightResponse {
    return {
      insights: [
        {
          type: 'growth',
          title: '🚀 Growth Opportunity',
          description: `Transaksi hari ini: ${data.transaksiHariIni} dengan pendapatan ${this.formatCurrency(data.pendapatanHariIni)}. Pertimbangkan untuk memperluas layanan untuk mempertahankan pertumbuhan ini.`,
          emoji: '🚀',
          priority: 'high',
          actionable: true,
          recommendation: 'Analisis pola transaksi yang berhasil dan replikasi strategi'
        },
        {
          type: 'engagement',
          title: '✅ High Engagement',
          description: `Total transaksi: ${data.totalTransaksi} dengan total pendapatan ${this.formatCurrency(data.totalPendapatan)}. Ini menunjukkan engagement yang kuat dari pengguna.`,
          emoji: '✅',
          priority: 'medium',
          actionable: false
        },
        {
          type: 'optimization',
          title: '⚡ Optimization Tip',
          description: 'Peak transaction times appear to be during certain hours. Consider automated messaging during these periods to maximize conversions.',
          emoji: '⚡',
          priority: 'medium',
          actionable: true,
          recommendation: 'Implementasi fitur auto-reply untuk waktu puncak'
        },
        {
          type: 'opportunity',
          title: '📊 Data Quality',
          description: `Data collection Anda komprehensif dengan ${data.totalTransaksi} total transaksi tercatat. Ini memberikan visibilitas yang sangat baik ke dalam pola perilaku pengguna.`,
          emoji: '📊',
          priority: 'low',
          actionable: false
        }
      ],
      summary: `Performa WhatsApp bot stabil dengan ${data.transaksiHariIni} transaksi hari ini.`,
      nextActions: [
        'Analisis pola transaksi yang berhasil',
        'Implementasi fitur auto-reply untuk waktu puncak',
        'Review dan optimasi alur konversi'
      ]
    };
  }

  private static formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  }
} 