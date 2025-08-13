# Deployment Guide

## Overview

This application uses a modern deployment pipeline with the following stack:
- **Platform**: Vercel
- **Database**: Supabase (PostgreSQL)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry + LogRocket
- **Analytics**: Google Analytics

## Prerequisites

1. **Accounts Required**:
   - Vercel account
   - Supabase project
   - GitHub repository
   - Sentry project
   - Google Analytics (optional)
   - LogRocket account (optional)

2. **Tools**:
   - Node.js 18+
   - Vercel CLI: `npm i -g vercel`
   - Git

## Environment Setup

### 1. Production Database (Supabase)

1. Go to [Supabase](https://supabase.com)
2. Create new project or use existing
3. Get connection details:
   - Database URL
   - Anon key
   - Service role key (for migrations)

### 2. Vercel Project Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
# ... add all other env vars
```

### 3. GitHub Secrets

Add these secrets to your GitHub repository:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

## Deployment Process

### Automatic Deployment

1. **Staging**: Push to `develop` branch
   - Runs tests and linting
   - Deploys to Vercel staging environment
   - Available at: `https://your-project-git-develop.vercel.app`

2. **Production**: Push to `main` branch
   - Runs full CI pipeline
   - Deploys to production
   - Available at: `https://your-domain.vercel.app`

### Manual Deployment

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

## Database Migrations

### Production Migration

```bash
# Set production database URL
export DATABASE_URL="postgresql://..."

# Run migrations
npx prisma db push

# Seed initial data (if needed)
npx prisma db seed
```

## Environment Variables

### Required for Production

```env
# Database
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Auth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=...
SENTRY_ORG=...
SENTRY_PROJECT=...

# Security
ENCRYPTION_KEY=64-char-hex-key
```

## Monitoring & Alerts

### Sentry Setup

1. Create Sentry project
2. Get DSN from project settings
3. Configure environment variables
4. Alerts are automatically configured

### Health Checks

- Application health: `/api/health`
- Database health: `/api/health/db`
- External services: `/api/health/services`

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check environment variables
   - Verify database connection
   - Check TypeScript errors

2. **Database Issues**:
   - Ensure Supabase project is not paused
   - Check connection string format
   - Verify migration status

3. **Authentication Issues**:
   - Update OAuth redirect URLs
   - Check NEXTAUTH_URL setting
   - Verify secrets are set

### Rollback Process

```bash
# Rollback to previous deployment
vercel rollback [deployment-url]

# Or redeploy specific commit
git checkout [commit-hash]
vercel --prod
```

## Performance Optimization

1. **Database**:
   - Connection pooling enabled
   - Query optimization
   - Indexes on frequently queried fields

2. **Caching**:
   - Static page caching
   - API response caching
   - CDN asset caching

3. **Monitoring**:
   - Core Web Vitals tracking
   - Error rate monitoring
   - Performance budgets

## Security

1. **Environment Variables**:
   - Never commit secrets to git
   - Use Vercel environment variables
   - Rotate keys regularly

2. **Database**:
   - Row Level Security (RLS) enabled
   - Connection encryption
   - Regular backups

3. **Application**:
   - HTTPS enforced
   - Security headers configured
   - Input validation and sanitization