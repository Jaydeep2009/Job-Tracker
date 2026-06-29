# JobTracker Web Dashboard

Job application tracking dashboard built with Next.js 16.

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_URL=https://job-tracker-production-f728.up.railway.app
```

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

This project is configured for Vercel deployment.

### Deploy to Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://job-tracker-production-f728.up.railway.app`
4. Deploy

## Features

- User authentication (register/login)
- Job application dashboard
- Filter by status and platform
- Update application status
- View application details

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI components
