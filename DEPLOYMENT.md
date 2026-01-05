# Deployment Guide - Vercel

This guide will help you deploy Body Pulse to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your Anthropic API key
- Your Supabase credentials (if using Supabase)

## Step 1: Prepare Your Repository

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   ```

2. **Push to GitHub/GitLab/Bitbucket:**
   ```bash
   git push origin main
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js settings
5. **Configure Environment Variables** (see Step 3 below)
6. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts to link your project

## Step 3: Configure Environment Variables

In your Vercel project settings, add the following environment variables:

### Required

- `ANTHROPIC_API_KEY` - Your Anthropic API key from [console.anthropic.com](https://console.anthropic.com/)

### Optional (but recommended)

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (server-side only)

### Optional (for testing)

- `DEMO_MODE` - Set to `true` to use mock data instead of real AI extraction

### How to Add Environment Variables in Vercel

1. Go to your project in Vercel dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable:
   - **Key**: Variable name (e.g., `ANTHROPIC_API_KEY`)
   - **Value**: Your actual value
   - **Environment**: Select "Production", "Preview", and/or "Development" as needed
4. Click "Save"
5. **Redeploy** your project for changes to take effect

## Step 4: Verify Deployment

1. Visit your deployment URL (e.g., `your-project.vercel.app`)
2. Test the upload flow with a sample InBody scan
3. Check the browser console for any errors
4. Verify API routes are working (check Vercel function logs)

## Step 5: Configure Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Troubleshooting

### Build Fails

- Check that all TypeScript errors are resolved (run `npm run build` locally)
- Verify all dependencies are in `package.json`
- Check Vercel build logs for specific errors

### API Routes Not Working

- Verify environment variables are set correctly
- Check Vercel function logs in the dashboard
- Ensure API routes are in the `app/api` directory

### Environment Variables Not Loading

- Make sure variables are added for the correct environment (Production/Preview/Development)
- Redeploy after adding new environment variables
- Check that variable names match exactly (case-sensitive)

### File Upload Issues

- Vercel has a 4.5MB limit for serverless functions by default
- For larger files, consider using Vercel Blob Storage or Supabase Storage
- The current implementation should work for typical InBody scan images (< 4MB)

## Performance Optimization

### Function Timeout

The extract API route is configured with a 60-second timeout in `vercel.json`. If you need longer:
1. Edit `vercel.json` and increase `maxDuration`
2. Note: Vercel Pro plan allows up to 300 seconds

### Image Optimization

Next.js automatically optimizes images. The `next.config.ts` already includes Supabase image domains.

## Monitoring

- **Vercel Analytics**: Enable in project settings for performance monitoring
- **Function Logs**: View in Vercel dashboard under "Functions" tab
- **Error Tracking**: Consider adding Sentry or similar for production error tracking

## Cost Considerations

- **Vercel Hobby Plan**: Free for personal projects
  - 100GB bandwidth/month
  - Unlimited serverless function executions
  - Perfect for MVP and testing

- **Vercel Pro Plan**: $20/month
  - More bandwidth
  - Longer function timeouts (up to 300s)
  - Team collaboration features

- **API Costs**: 
  - Anthropic API: ~$0.00025 per scan (Claude 3 Haiku)
  - Monitor usage in Anthropic dashboard

## Next Steps After Deployment

1. Set up monitoring and error tracking
2. Configure custom domain
3. Set up CI/CD (automatic deployments on push)
4. Enable Vercel Analytics
5. Consider adding rate limiting for API routes
6. Set up database backups (if using Supabase)

## Support

If you encounter issues:
1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review build logs in Vercel dashboard
3. Test locally first with `npm run build`

