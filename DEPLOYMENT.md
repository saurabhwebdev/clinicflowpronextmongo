# Deployment Guide for ClinicFlow Pro

## Vercel Deployment

### Prerequisites
- Vercel account
- MongoDB Atlas database (already configured)
- Gmail account for email functionality

### Step 1: Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Select "Next.js" as the framework preset

### Step 2: Configure Environment Variables
In your Vercel project dashboard, go to Settings > Environment Variables and add:

```
MONGODB_URI=mongodb+srv://iamsaurabhthakur29:qyZkotKZVUuE6Tu7@cluster0.l69za6n.mongodb.net/docudocflask?retryWrites=true&w=majority&appName=Cluster0
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=clinicflow-super-secret-key-2024-production-ready
GMAIL_USER=worlddj0@gmail.com
GMAIL_APP_PASSWORD=uyos btpm rvsn toxt
NODE_ENV=production
```

**Important:** Replace `your-app-name.vercel.app` with your actual Vercel domain.

### Step 3: Deploy
1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be live at `https://your-app-name.vercel.app`

### Step 4: Create Master Admin (Post-deployment)
After deployment, you'll need to create the first admin user. You can do this by:

1. Temporarily add a script endpoint or
2. Use MongoDB Compass/Atlas to manually create the first user
3. Or create a one-time setup page

### Database Configuration
- MongoDB Atlas is already configured
- Database name: `docudocflask`
- Connection string includes retry writes and majority write concern for production reliability

### Security Notes
- All sensitive data is stored in environment variables
- NextAuth secret is production-ready
- MongoDB connection uses SSL by default with Atlas

### Post-Deployment Checklist
- [ ] Verify all environment variables are set
- [ ] Test user authentication
- [ ] Test email functionality
- [ ] Create first master admin user
- [ ] Test all major features
- [ ] Set up monitoring (optional)

### Troubleshooting
- If MongoDB connection fails, check the connection string and network access in Atlas
- If emails don't send, verify Gmail app password is correct
- If authentication fails, ensure NEXTAUTH_URL matches your domain exactly