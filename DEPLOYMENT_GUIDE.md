# 🚀 Netlify Deployment Guide

## Prerequisites

Before deploying to Netlify, make sure you have:

1. **Supabase Project** set up with all required tables
2. **Google OAuth** credentials configured
3. **Netlify Account** (free tier is sufficient)

## Step 1: Environment Variables Setup

### Required Environment Variables

You need to set these environment variables in your Netlify dashboard:

#### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### NextAuth Configuration
```
NEXTAUTH_URL=https://your-app-name.netlify.app
NEXTAUTH_SECRET=your_nextauth_secret_key
```

#### Google OAuth (Optional)
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### OpenAI API (Optional - for AI features)
```
OPENAI_API_KEY=your_openai_api_key
```

### How to Get These Values:

#### 1. Supabase Values
1. Go to your Supabase project dashboard
2. Go to **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

#### 2. NextAuth Secret
Generate a random secret:
```bash
openssl rand -base64 32
```

#### 3. Google OAuth (if using)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://your-app-name.netlify.app/api/auth/callback/google`

## Step 2: Netlify Configuration

### 2.1 Set Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add all the environment variables listed above

### 2.2 Build Settings

The `netlify.toml` file is already configured with:
- Build command: `npm run build`
- Publish directory: `.next`
- Node.js version: 18

### 2.3 Domain Configuration

1. In Netlify dashboard, go to **Domain settings**
2. Set your custom domain or use the provided Netlify subdomain
3. Update `NEXTAUTH_URL` to match your domain

## Step 3: Database Setup

### 3.1 Run Required SQL Scripts

Make sure you've run these SQL scripts in your Supabase SQL editor:

1. **Database Schema** (if not already done):
   ```sql
   -- Run the complete database setup
   -- This includes users, businesses, products, bills, etc.
   ```

2. **RLS Policies** (if not already done):
   ```sql
   -- Enable Row Level Security
   -- Set up proper policies for data access
   ```

### 3.2 Test Database Connection

Before deploying, test that your environment variables work locally:

1. Create a `.env.local` file with your values
2. Run `npm run dev`
3. Check that the app loads without Supabase errors

## Step 4: Deploy to Netlify

### 4.1 Connect Repository

1. Go to Netlify dashboard
2. Click **New site from Git**
3. Connect your GitHub/GitLab repository
4. Select the repository with your project

### 4.2 Configure Build Settings

Netlify should auto-detect Next.js, but verify:
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 18

### 4.3 Deploy

1. Click **Deploy site**
2. Wait for the build to complete
3. Check the build logs for any errors

## Step 5: Post-Deployment Setup

### 5.1 Update Google OAuth Redirect URI

1. Go to Google Cloud Console
2. Update the authorized redirect URI to your Netlify domain:
   `https://your-app-name.netlify.app/api/auth/callback/google`

### 5.2 Test the Application

1. Visit your Netlify URL
2. Try signing in with Google
3. Test creating a business
4. Test adding products and creating bills

## Troubleshooting

### Common Issues:

#### 1. "Supabase environment variables not configured"
- **Solution**: Make sure all Supabase environment variables are set in Netlify
- **Check**: Go to Site settings → Environment variables

#### 2. "NextAuth configuration error"
- **Solution**: Set `NEXTAUTH_URL` to your Netlify domain
- **Check**: Environment variables are properly set

#### 3. "Google OAuth error"
- **Solution**: Update redirect URI in Google Cloud Console
- **Check**: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set

#### 4. "Database connection failed"
- **Solution**: Check Supabase URL and keys
- **Check**: RLS policies are properly configured

### Build Logs

If deployment fails:
1. Check the build logs in Netlify
2. Look for specific error messages
3. Verify all environment variables are set
4. Check that all required files are in the repository

## Security Notes

1. **Never commit** `.env.local` or `.env` files
2. **Use environment variables** for all sensitive data
3. **Enable RLS** in Supabase for data security
4. **Use HTTPS** (Netlify provides this automatically)

## Support

If you encounter issues:
1. Check the build logs in Netlify
2. Verify all environment variables are set correctly
3. Test locally with the same environment variables
4. Check Supabase logs for database-related issues

---

**Happy Deploying! 🚀**
