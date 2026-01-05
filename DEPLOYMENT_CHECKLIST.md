# Vercel Deployment Checklist

Use this checklist to ensure everything is ready for deployment.

## Pre-Deployment

- [x] **Build passes locally** - `npm run build` completes successfully
- [x] **TypeScript errors fixed** - No type errors in build output
- [x] **All dependencies installed** - `package.json` is up to date
- [x] **Environment variables documented** - See `DEPLOYMENT.md`
- [x] **Vercel configuration** - `vercel.json` created with proper settings
- [ ] **Git repository ready** - All changes committed and pushed
- [ ] **Test locally** - App works in development mode

## Vercel Setup

- [ ] **Create Vercel account** - Sign up at vercel.com
- [ ] **Import project** - Connect your Git repository
- [ ] **Set environment variables:**
  - [ ] `ANTHROPIC_API_KEY` (Required)
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` (Optional)
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Optional)
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (Optional)
  - [ ] `DEMO_MODE` (Optional, set to `false` for production)

## Post-Deployment

- [ ] **Verify deployment** - Visit your Vercel URL
- [ ] **Test upload flow** - Upload a sample InBody scan
- [ ] **Check API routes** - Verify extract endpoint works
- [ ] **Test authentication** - Verify login/signup works (if using Supabase)
- [ ] **Check function logs** - Review Vercel function logs for errors
- [ ] **Test on mobile** - Verify responsive design works
- [ ] **Set up custom domain** (Optional)

## Environment-Specific Checks

### Production
- [ ] `DEMO_MODE` is set to `false` or not set
- [ ] All required API keys are configured
- [ ] Database is properly configured (if using Supabase)

### Preview/Development
- [ ] Can use `DEMO_MODE=true` for testing
- [ ] Preview deployments work correctly

## Troubleshooting

If deployment fails:
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Run `npm run build` locally to catch errors early
4. Check function logs for runtime errors

## Quick Deploy Commands

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Notes

- The extract API route has a 60-second timeout (configured in `vercel.json`)
- Vercel automatically optimizes Next.js apps
- Environment variables need to be set in Vercel dashboard
- Redeploy after adding new environment variables

