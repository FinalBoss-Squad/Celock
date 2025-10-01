# Cloudflare Pages Deployment Guide

This guide walks you through deploying the x402 Gateway to Cloudflare Pages.

## Why Cloudflare Pages?

- **Global CDN**: 300+ edge locations worldwide for ultra-fast content delivery
- **Free SSL**: Automatic HTTPS with Cloudflare's Universal SSL
- **Analytics**: Built-in Web Analytics (privacy-first, no tracking)
- **DDoS Protection**: Enterprise-grade protection included
- **Custom Domains**: Easy custom domain setup
- **Instant Rollbacks**: One-click rollback to any previous deployment
- **Preview Deployments**: Every PR gets a unique preview URL

## Prerequisites

1. **Cloudflare Account**: [Sign up for free](https://dash.cloudflare.com/sign-up)
2. **Git Repository**: Code pushed to GitHub/GitLab/Bitbucket
3. **Node.js 18+**: For local builds

## Deployment Methods

### Method 1: Wrangler CLI (Fastest)

#### Step 1: Install Wrangler
```bash
npm install -g wrangler
# or use the local version
npm install
```

#### Step 2: Authenticate
```bash
wrangler login
```
This opens your browser to authorize Wrangler with your Cloudflare account.

#### Step 3: Set Environment Variables
Create a `.dev.vars` file (gitignored) for local development:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

For production, set variables in Cloudflare dashboard:
1. Go to **Workers & Pages** → **x402-gateway** → **Settings** → **Environment variables**
2. Add production variables

#### Step 4: Deploy
```bash
npm run pages:deploy
```

Your site will be live at `https://x402-gateway.pages.dev`

#### Step 5: Custom Domain (Optional)
1. In Cloudflare dashboard, go to **Workers & Pages** → **x402-gateway** → **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (must be on Cloudflare DNS)
4. Follow the prompts to add DNS records

### Method 2: GitHub Actions (Recommended for Teams)

This method auto-deploys on every push to `main`.

#### Step 1: Create Cloudflare API Token
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use template **Edit Cloudflare Workers**
4. Add **Account** > **Cloudflare Pages** > **Edit** permission
5. Copy the generated token

#### Step 2: Get Account ID
1. Go to **Workers & Pages** in Cloudflare dashboard
2. Your Account ID is in the right sidebar

#### Step 3: Configure GitHub Secrets
In your GitHub repo, go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:
- `CLOUDFLARE_API_TOKEN`: The token from Step 1
- `CLOUDFLARE_ACCOUNT_ID`: Your account ID from Step 2
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon key

#### Step 4: Push to Main
```bash
git add .
git commit -m "Setup Cloudflare Pages deployment"
git push origin main
```

GitHub Actions will automatically build and deploy to Cloudflare Pages.

#### Step 5: Monitor Deployment
- Check **Actions** tab in GitHub to see build progress
- Check **Workers & Pages** in Cloudflare to see deployment status

### Method 3: Cloudflare Dashboard (UI)

#### Step 1: Create Pages Project
1. Go to **Workers & Pages** in Cloudflare dashboard
2. Click **Create application** → **Pages** → **Connect to Git**
3. Authorize Cloudflare to access your GitHub/GitLab
4. Select the `traffic-mint` repository

#### Step 2: Configure Build Settings
- **Production branch**: `main`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave empty)

#### Step 3: Environment Variables
Add these variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `NODE_VERSION`: `18.17.0`

#### Step 4: Deploy
Click **Save and Deploy**

Cloudflare will build and deploy your site. Future pushes to `main` will automatically trigger new deployments.

## Local Development with Cloudflare Pages

Test your site locally with Cloudflare's runtime:

```bash
# Build the site
npm run build

# Run with Wrangler Pages dev server
npm run pages:dev
```

Access at `http://localhost:8788`

## Configuration Files

### `wrangler.toml`
Main configuration for Cloudflare Pages:
- Project name
- Build output directory
- Environment settings
- Custom domain routes

### `_headers`
HTTP headers applied to all requests:
- Security headers (X-Frame-Options, CSP)
- Cache-Control for static assets

### `_redirects`
URL redirects and SPA routing:
- Fallback to `index.html` for client-side routing

### `.node-version`
Specifies Node.js version for Cloudflare builds.

## Performance Optimizations

The Cloudflare Pages setup includes:

1. **Asset Caching**: `_headers` sets immutable cache for `/assets/*`
2. **Brotli Compression**: Automatic compression for text files
3. **HTTP/2 & HTTP/3**: Enabled by default
4. **Smart Routing**: Argo Smart Routing for fastest paths
5. **Edge Caching**: Static assets cached at 300+ locations

## Monitoring & Analytics

### Cloudflare Web Analytics
1. Go to **Analytics & Logs** → **Web Analytics** in Cloudflare dashboard
2. Enable analytics for your Pages project
3. View traffic, performance, and Core Web Vitals

### Build Logs
View build logs:
1. **Workers & Pages** → **x402-gateway** → **Deployments**
2. Click any deployment to see full build logs

## Troubleshooting

### Build Fails
**Issue**: Build command fails

**Solution**:
```bash
# Check Node.js version
node --version  # Should be 18+

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working
**Issue**: Supabase connection fails

**Solution**:
1. Verify variables in Cloudflare dashboard
2. Redeploy after changing variables
3. Check variable names (must start with `VITE_`)

### 404 on Routes
**Issue**: React Router routes return 404

**Solution**: Ensure `_redirects` file exists with SPA fallback:
```
/*    /index.html   200
```

### Custom Domain SSL Issues
**Issue**: SSL certificate not provisioning

**Solution**:
1. Ensure domain is on Cloudflare DNS (orange-clouded)
2. Wait up to 24 hours for SSL provisioning
3. Check **SSL/TLS** → **Edge Certificates** in Cloudflare

## Advanced Configuration

### Branch Deployments
Every branch gets a preview URL:
- `main` → `https://x402-gateway.pages.dev`
- `dev` → `https://dev.x402-gateway.pages.dev`
- PR #123 → `https://pr-123.x402-gateway.pages.dev`

### Rollbacks
To rollback to a previous deployment:
1. Go to **Workers & Pages** → **x402-gateway** → **Deployments**
2. Find the working deployment
3. Click **...** → **Rollback to this deployment**

### Custom Build Command
Modify build command in `wrangler.toml` or Cloudflare dashboard:
```toml
[build]
command = "npm run build:production"
```

### Functions (Advanced)
Add serverless functions in `/functions` directory:
```
functions/
  api/
    hello.ts  # Available at /api/hello
```

## Cost

**Cloudflare Pages is free** for:
- Unlimited sites
- Unlimited requests
- 500 builds/month
- 100 GB bandwidth/month

**Pro Plan** ($20/month) includes:
- 5,000 builds/month
- Analytics
- Priority support

## Support

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Community](https://community.cloudflare.com/)
- [Discord](https://discord.cloudflare.com)

## Next Steps

1. ✅ Deploy to Cloudflare Pages
2. 🌐 Add custom domain
3. 📊 Enable Web Analytics
4. 🔒 Configure security headers
5. ⚡ Set up preview deployments for PRs

Your x402 Gateway is now running on Cloudflare's global edge network! 🚀
