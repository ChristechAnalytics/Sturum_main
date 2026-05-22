# Deployment Guide for Sturum

This guide will help you deploy your Sturum application to free hosting services for testing.

## Prerequisites
- GitHub account (you already have this)
- MongoDB Atlas account (you're already using this)

## Deployment Options

### Option 1: Render (Recommended - Easiest)
**Free tier available, easy setup**

#### Backend Deployment (Render)

1. **Go to [render.com](https://render.com)** and sign up/login

2. **Create a New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Backend:**
   - **Name:** `sturum-backend`
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Root Directory:** Leave empty (or set to `backend`)

4. **Set Environment Variables:**
   - Click "Environment" tab
   - Add these variables:
     ```
     NODE_ENV=production
     PORT=10000
     MONGO_URI_COMPASS=your_mongodb_atlas_connection_string
     JWT_SECRET=your_jwt_secret_key
     FRONTEND_URL=https://your-frontend-url.vercel.app
     ```
   - **Note:** Update `FRONTEND_URL` after deploying frontend

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your backend URL (e.g., `https://sturum-backend.onrender.com`)

#### Frontend Deployment (Vercel)

1. **Go to [vercel.com](https://vercel.com)** and sign up/login with GitHub

2. **Import Project:**
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Configure Frontend:**
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

4. **Set Environment Variables:**
   - Add: `REACT_APP_API_URL=https://your-backend-url.onrender.com`
   - Replace with your actual Render backend URL

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment (2-5 minutes)
   - Copy your frontend URL

6. **Update Backend CORS:**
   - Go back to Render dashboard
   - Update `FRONTEND_URL` environment variable with your Vercel URL
   - Redeploy backend

---

### Option 2: Railway (All-in-One)
**Free tier available, can host both frontend and backend**

1. **Go to [railway.app](https://railway.app)** and sign up with GitHub

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Deploy Backend:**
   - Click "New" → "Service" → "GitHub Repo"
   - Select your repo
   - Set **Root Directory:** `backend`
   - Railway will auto-detect Node.js
   - Add environment variables (same as Render)
   - Railway will generate a URL automatically

4. **Deploy Frontend:**
   - Click "New" → "Service" → "GitHub Repo"
   - Select your repo again
   - Set **Root Directory:** `frontend`
   - Set **Build Command:** `npm install && npm run build`
   - Set **Start Command:** `npx serve -s build`
   - Add environment variable: `REACT_APP_API_URL=your-backend-url`

---

### Option 3: Netlify (Frontend) + Render (Backend)

#### Frontend on Netlify:

1. **Go to [netlify.com](https://netlify.com)** and sign up

2. **Deploy:**
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub and select your repo
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/build`

3. **Environment Variables:**
   - Go to Site settings → Environment variables
   - Add: `REACT_APP_API_URL=https://your-backend-url.onrender.com`

---

## Important: Update Frontend API URLs

After deployment, you need to update all API calls in your frontend to use the environment variable.

### Update Frontend Code

Create a file `frontend/src/config.js`:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
export default API_URL;
```

Then update all fetch calls to use this:
- Replace `http://localhost:4000` with `API_URL` or use the environment variable directly

**Quick Find & Replace:**
- Find: `http://localhost:4000`
- Replace: `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}`

---

## MongoDB Atlas Configuration

Make sure your MongoDB Atlas connection string:
1. Allows connections from anywhere (0.0.0.0/0) in Network Access
2. Has a database user created
3. Includes the database name in the connection string

---

## Testing After Deployment

1. Visit your frontend URL
2. Try signing up a new user
3. Test all features:
   - Login/Logout
   - Create posts
   - Upload materials
   - Send messages
   - Friend requests

---

## Troubleshooting

### Backend Issues:
- Check Render/Railway logs for errors
- Verify environment variables are set correctly
- Ensure MongoDB connection string is correct

### Frontend Issues:
- Check browser console for CORS errors
- Verify `REACT_APP_API_URL` is set correctly
- Make sure backend URL is accessible

### CORS Errors:
- Update backend `FRONTEND_URL` environment variable
- Redeploy backend after updating

---

## Recommended: Option 1 (Render + Vercel)
This is the easiest and most reliable free option for testing.
