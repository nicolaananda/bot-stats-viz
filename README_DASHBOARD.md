# WhatsApp Bot Dashboard

A modern, responsive analytics dashboard built with React, TypeScript, and Tailwind CSS for monitoring WhatsApp bot transactions, user activity, and business metrics.

## Features

### 🎯 **Core Dashboard Pages**
- **Overview** - Key metrics, charts, and recent activity
- **Charts** - Daily/monthly analytics with interactive visualizations  
- **Users** - User management, activity tracking, and detailed profiles
- **Products** - Product performance, sales analytics, and top performers
- **Transactions** - Transaction search, recent activity, and export functionality
- **Analytics** - Advanced insights, trends, and AI-powered recommendations

### 🎨 **Design & UI**
- Modern gradient-based design system
- Fully responsive (mobile, tablet, desktop)
- Dark/light mode color scheme
- Beautiful animations and micro-interactions
- Professional shadcn/ui components
- Custom stats cards and data visualizations

### 📊 **Data Visualization**
- Interactive Recharts with tooltips and animations
- Line charts, bar charts, pie charts, and area charts
- Responsive charts that adapt to screen size
- Beautiful gradients and color schemes
- Real-time data updates with React Query

### 🔧 **Technical Features**
- TypeScript for type safety
- React Query for efficient data fetching and caching
- Axios for API communication
- React Router for navigation
- Shadcn/ui for consistent components
- Tailwind CSS for styling
- Full API integration with error handling

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- API server running on `http://localhost:3000` (or configure `VITE_API_URL`)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <your-repo-url>
cd dashboard-project
npm install
```

2. **Configure API URL (optional):**
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3000
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to `http://localhost:8080`

### Build for Production
```bash
npm run build
```

## API Integration

The dashboard connects to your WhatsApp bot API server and uses the following endpoints:

- `GET /api/dashboard/overview` - Dashboard overview data
- `GET /api/dashboard/chart/daily` - Daily chart data
- `GET /api/dashboard/chart/monthly` - Monthly chart data
- `GET /api/dashboard/users/activity` - User activity data
- `GET /api/dashboard/users/stats` - User statistics
- `GET /api/dashboard/users/:userId/transactions` - User transactions
- `GET /api/dashboard/products/stats` - Product statistics
- `GET /api/dashboard/transactions/recent` - Recent transactions
- `GET /api/dashboard/transactions/search/:reffId` - Search transactions
- `GET /api/dashboard/export/:format` - Export data

## Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── stats-card.tsx  # Custom stats card component
│   │   └── ...            # Shadcn/ui components
│   ├── charts/            # Chart components
│   │   └── overview-chart.tsx
│   └── layout/            # Layout components
│       ├── dashboard-sidebar.tsx
│       └── dashboard-header.tsx
├── pages/                 # Page components
│   ├── dashboard-overview.tsx
│   ├── charts.tsx
│   ├── users.tsx
│   ├── products.tsx
│   ├── transactions.tsx
│   └── analytics.tsx
├── services/              # API services
│   └── api.ts            # Axios instance and API functions
├── types/                 # TypeScript type definitions
│   └── dashboard.ts      # API response types
├── hooks/                 # Custom React hooks
└── lib/                   # Utility functions
```

## Design System

The dashboard uses a custom design system with:

### Colors
- **Primary**: Beautiful blue-purple gradient
- **Secondary**: Light background variations
- **Success**: Green for positive metrics
- **Warning**: Orange for alerts
- **Info**: Blue for informational content

### Typography
- **Font**: Inter (Google Fonts)
- **Hierarchy**: Clear heading and body text scales
- **Weights**: 300-800 range for different emphasis

### Components
- **Cards**: Glassmorphism effect with subtle shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Charts**: Custom color scheme matching the design
- **Tables**: Clean, hoverable rows with good spacing

## Key Components

### StatsCard
Reusable component for displaying key metrics:
```tsx
<StatsCard
  title="Total Revenue"
  value={formatCurrency(totalRevenue)}
  change="+12.5% from last month"
  changeType="positive"
  icon={DollarSign}
/>
```

### OverviewChart
Interactive chart component with multiple data series:
```tsx
<OverviewChart 
  data={chartData}
  title="Revenue Trends"
  description="Daily revenue, transactions, and profit overview"
/>
```

## Customization

### Adding New Pages
1. Create a new component in `src/pages/`
2. Add the route to `src/App.tsx`
3. Add navigation link to `src/components/layout/dashboard-sidebar.tsx`

### Styling
- Modify `src/index.css` for global styles and design tokens
- Update `tailwind.config.ts` for theme customization
- Use semantic color classes like `text-primary` instead of direct colors

### API Integration
- Add new endpoints to `src/services/api.ts`
- Define TypeScript types in `src/types/dashboard.ts`
- Use React Query for data fetching in components

## Performance Optimizations

- **React Query** for efficient data caching and background updates
- **Lazy loading** for large datasets
- **Memoization** for expensive calculations
- **Responsive images** and optimized assets
- **Tree shaking** for minimal bundle size

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code structure and naming conventions
2. Use TypeScript for all new components
3. Add proper error handling for API calls
4. Test responsive design on multiple screen sizes
5. Follow the design system for consistent styling

## Troubleshooting

### API Connection Issues
- Verify your API server is running on the correct port
- Check the `VITE_API_URL` environment variable
- Ensure CORS is properly configured on your API server

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors in your IDE
- Verify all imports are correct

### Performance Issues
- Check React Query DevTools for cache status
- Monitor network requests in browser DevTools
- Consider implementing virtual scrolling for large datasets

## License

This project is built for dashboard analytics and includes modern web development best practices.