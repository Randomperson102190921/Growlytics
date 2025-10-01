# Growlytics Deployment Guide

This guide provides step-by-step instructions for deploying the Growlytics plant care app to various hosting platforms.

## Prerequisites

Before deploying, ensure you have:

1. **Firebase Project Setup**: Your Firebase project should be configured with:
   - Authentication enabled
   - Realtime Database enabled
   - Security rules configured

2. **Environment Variables**: Create a `.env.local` file with your Firebase config:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

3. **Build the App**:
   ```bash
   npm install
   npm run build
   ```

## Deployment Options

### 🚀 Option 1: Vercel (Recommended for Next.js)

Vercel is the easiest and most optimized platform for Next.js applications.

#### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub, GitLab, or email
3. Connect your GitHub account

#### Step 2: Deploy from GitHub
1. Click "New Project" on your Vercel dashboard
2. Import your GitHub repository
3. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (leave default)

#### Step 3: Add Environment Variables
1. In your project settings, go to "Environment Variables"
2. Add all your Firebase environment variables
3. Set environment to "Production"

#### Step 4: Deploy
1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be live at `https://your-project-name.vercel.app`

#### Step 5: Configure Custom Domain (Optional)
1. Go to project settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions

---

### 🌐 Option 2: Netlify

Netlify is another great option with excellent performance.

#### Step 1: Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub, GitLab, or email

#### Step 2: Deploy from GitHub
1. Click "New site from Git"
2. Connect your GitHub repository
3. Configure build settings:
   - **Branch**: `main` (or your default branch)
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

#### Step 3: Add Environment Variables
1. Go to Site settings > Environment variables
2. Add all your Firebase environment variables

#### Step 4: Deploy
1. Click "Deploy site"
2. Wait for the build to complete
3. Your app will be live at `https://random-name.netlify.app`

#### Step 5: Configure Custom Domain (Optional)
1. Go to Site settings > Domain management
2. Add custom domain
3. Configure DNS records

---

### 🔥 Option 3: Firebase Hosting

Since you're already using Firebase, this provides seamless integration.

#### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

#### Step 2: Login to Firebase
```bash
firebase login
```

#### Step 3: Initialize Firebase Hosting
```bash
firebase init hosting
```
- Select your Firebase project
- Choose "Next.js" as the framework
- Set public directory to `.next`
- Configure as a single-page app: No

#### Step 4: Configure firebase.json
Update your `firebase.json`:
```json
{
  "hosting": {
    "public": ".next",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

#### Step 5: Build and Deploy
```bash
npm run build
firebase deploy --only hosting
```

#### Step 6: Configure Custom Domain (Optional)
1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Follow DNS configuration instructions

---

### 🐙 Option 4: GitHub Pages (Free)

For a free hosting option, though less optimal for Next.js.

#### Step 1: Install next export package
```bash
npm install --save-dev @zeit/next-staticsite
```

#### Step 2: Update next.config.mjs
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
```

#### Step 3: Build Static Site
```bash
npm run build
```

#### Step 4: Deploy to GitHub Pages
1. Push your code to GitHub
2. Go to repository Settings > Pages
3. Set source to "GitHub Actions"
4. Create a new workflow file: `.github/workflows/deploy.yml`

#### Step 5: Create GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./out
```

---

### 🐳 Option 5: Docker + Cloud Platform

For more control over the deployment environment.

#### Step 1: Create Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Step 2: Update next.config.mjs for Docker
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
}

export default nextConfig
```

#### Step 3: Deploy to Docker-compatible platforms
- **Railway**: Connect GitHub repo, auto-deploys
- **Render**: Connect GitHub, use Docker
- **Fly.io**: Use `fly deploy`
- **DigitalOcean App Platform**: Connect repo with Dockerfile

---

## 🔒 Security Considerations

### Firebase Security Rules

Update your Firebase Realtime Database rules in the Firebase Console:

```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId",
        "plants": {
          ".indexOn": ["dateAdded"]
        },
        "reminders": {
          ".indexOn": ["nextDue"]
        },
        "tasks": {
          ".indexOn": ["dueDate"]
        }
      }
    }
  }
}
```

### Environment Variables Security

- Never commit `.env.local` to version control
- Use different Firebase projects for development/staging/production
- Rotate API keys regularly
- Use Firebase App Check for additional security

---

## 🚀 Performance Optimization

### Before Deployment

1. **Enable Compression**:
   ```javascript
   // next.config.mjs
   const nextConfig = {
     compress: true,
   }
   ```

2. **Optimize Images**: Already configured with Next.js Image component

3. **Enable Caching**: Configure appropriate cache headers

### Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Firebase Performance Monitoring**: Track app performance
- **Google Analytics**: User behavior tracking

---

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version compatibility
   - Ensure all dependencies are installed
   - Verify environment variables are set

2. **Firebase Connection Issues**:
   - Verify Firebase config is correct
   - Check Firebase project settings
   - Ensure security rules allow access

3. **Authentication Problems**:
   - Verify Firebase Auth is enabled
   - Check authorized domains in Firebase Console
   - Ensure correct redirect URIs

### Support

- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **Firebase**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)

---

## 📋 Deployment Checklist

- [ ] Firebase project configured
- [ ] Environment variables set
- [ ] App builds successfully locally
- [ ] Firebase security rules updated
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled
- [ ] Performance monitoring set up
- [ ] Error tracking configured

Happy deploying! 🚀