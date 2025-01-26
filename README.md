# Online Form Application

A web application for collecting and managing form submissions with file uploads.

## Features

- User-friendly form submission
- File upload support (images)
- Admin dashboard
- Excel export functionality
- Secure authentication
- Responsive design

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: Supabase
- Storage: Supabase Storage
- Authentication: JWT

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
```

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

## Deployment

This application is configured for deployment on Vercel.

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

## License

MIT
