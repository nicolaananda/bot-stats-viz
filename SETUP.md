# Setup Guide - Bot Stats Dashboard

## Prerequisites

- Node.js 18+ 
- npm, yarn, or bun package manager
- API server running (see API Contract below)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bot-stats-viz
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
bun install
```

## Environment Configuration

Create a `.env` file in the root directory:

```bash
# API Configuration
VITE_API_URL=http://185.201.9.64:3002

# Optional: Override default API timeout (in milliseconds)
VITE_API_TIMEOUT=10000

# Optional: Enable/disable API request logging
VITE_API_LOGGING=true
```

### Environment Variables

- `VITE_API_URL`: The base URL of your API server (default: http://localhost:3000)
- `VITE_API_TIMEOUT`: API request timeout in milliseconds (default: 10000)
- `VITE_API_LOGGING`: Enable/disable API request logging (default: true)

## Running the Application

### Development Mode
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

The application will start at `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

## API Contract

The dashboard expects the following API endpoints to be available:

### Base URL
- **Development**: `http://185.201.9.64:3002`
- **Production**: Set via `VITE_API_URL` environment variable

### Required Endpoints

1. **Dashboard Overview** - `GET /api/dashboard/overview`
2. **Daily Chart Data** - `GET /api/dashboard/chart/daily`
3. **Monthly Chart Data** - `GET /api/dashboard/chart/monthly`
4. **User Activity** - `GET /api/dashboard/users/activity`
5. **User Statistics** - `GET /api/dashboard/users/stats`
6. **User Transactions** - `GET /api/dashboard/users/:userId/transactions`
7. **Product Statistics** - `GET /api/dashboard/products/stats`
8. **Recent Transactions** - `GET /api/dashboard/transactions/recent`
9. **Search Transaction** - `GET /api/dashboard/transactions/search/:reffId`
10. **Export Data** - `GET /api/dashboard/export/:format`

### API Response Format

All API responses must follow this format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure your API server is running
   - Check the `VITE_API_URL` in your `.env` file
   - Verify the API server is accessible from your browser

2. **CORS Errors**
   - Ensure your API server has CORS enabled
   - Check that the API server allows requests from `http://localhost:5173`

3. **Data Not Loading**
   - Check browser console for API errors
   - Verify API endpoints return data in the expected format
   - Check network tab for failed requests

### Debug Mode

Enable detailed logging by setting:
```bash
VITE_API_LOGGING=true
```

This will log all API requests and responses to the console.

## Development

### Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # API service layer
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
└── config/             # Configuration files
```

### Adding New API Endpoints

1. Add the endpoint to `src/config/api.ts`
2. Add the corresponding type to `src/types/dashboard.ts`
3. Add the API method to `src/services/api.ts`
4. Use the new API method in your components

### Testing

The application uses React Query for data fetching, which provides:
- Automatic caching
- Background refetching
- Error handling
- Loading states

## Production Deployment

1. Set the correct `VITE_API_URL` for your production API
2. Build the application: `npm run build`
3. Deploy the `dist/` folder to your web server
4. Ensure your API server is accessible from your web server

## Support

For API-related issues, refer to the backend team or check the API server logs.
For frontend issues, check the browser console and network tab. 