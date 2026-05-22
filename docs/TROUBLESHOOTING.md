# Troubleshooting "Failed to Fetch" Error

## Common Causes and Solutions

### 1. Environment Variable Not Set in Vercel

**Problem:** `REACT_APP_API_URL` is not set or is incorrect in Vercel.

**Solution:**
1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add/Edit:
   - **Key:** `REACT_APP_API_URL`
   - **Value:** Your Render backend URL (e.g., `https://sturum-backend.onrender.com`)
   - **Environment:** Production, Preview, Development (select all)
4. **IMPORTANT:** After adding/updating, you MUST redeploy:
   - Go to **Deployments** tab
   - Click the **⋯** menu on the latest deployment
   - Click **Redeploy**

### 2. Backend CORS Not Configured

**Problem:** Backend is blocking requests from Vercel frontend.

**Solution:**
1. Go to Render dashboard
2. Check environment variables:
   - **Key:** `FRONTEND_URL`
   - **Value:** Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
3. After updating, redeploy the backend

### 3. Backend Not Running

**Problem:** Backend service is down or not accessible.

**Check:**
1. Visit your Render backend URL directly: `https://your-backend.onrender.com`
2. You should see: `{"message":"Sturum API is running","status":"ok",...}`
3. If you see an error, check Render logs

### 4. Environment Variable Not Available at Build Time

**Problem:** React environment variables are embedded at BUILD time, not runtime.

**Solution:**
- After setting `REACT_APP_API_URL` in Vercel, you MUST trigger a new build
- Vercel will automatically rebuild if you push to GitHub
- Or manually redeploy from Vercel dashboard

### 5. Check Browser Console

**Steps:**
1. Open your Vercel app in browser
2. Open Developer Tools (F12)
3. Go to **Console** tab
4. Look for:
   - `API_URL: ...` - Should show your Render backend URL
   - `REACT_APP_API_URL env var: ...` - Should show your Render backend URL
5. Go to **Network** tab
6. Try logging in
7. Check the failed request:
   - What URL is it trying to reach?
   - What error message?

### 6. Verify Backend is Accessible

**Test in browser:**
```
https://your-backend.onrender.com/api/users/login
```

Should return an error (needs POST), but NOT a connection error.

### 7. Check Render Backend Logs

1. Go to Render dashboard
2. Click on your backend service
3. Go to **Logs** tab
4. Look for:
   - CORS errors
   - Connection errors
   - Database connection errors

### 8. Common Mistakes

- ❌ Setting environment variable but not redeploying
- ❌ Using `http://` instead of `https://` in production
- ❌ Missing trailing slash or extra slashes in URLs
- ❌ Backend URL has `/api` at the end (should be just the base URL)
- ❌ CORS origin mismatch (backend FRONTEND_URL doesn't match Vercel URL)

## Quick Checklist

- [ ] `REACT_APP_API_URL` is set in Vercel environment variables
- [ ] Value is `https://your-backend.onrender.com` (no trailing slash, no `/api`)
- [ ] Redeployed Vercel after setting environment variable
- [ ] `FRONTEND_URL` is set in Render environment variables
- [ ] Value is `https://your-app.vercel.app` (your exact Vercel URL)
- [ ] Backend is running (visit backend URL directly)
- [ ] Check browser console for actual error messages
- [ ] Check Network tab to see what URL is being called

## Profile pictures or post images disappear after a while

**Cause:** On Render (and similar hosts), files saved to the server’s local `uploads/` folder are **deleted** when the service restarts, redeploys, or sleeps. MongoDB still had the path, but the file was gone.

**Fix (in codebase):** New uploads are stored in **MongoDB GridFS** (same Atlas database), so they persist across redeploys.

**What you need to do:**

1. **Redeploy the backend** with the latest code.
2. **Re-upload** profile photos and post images that disappeared (old `/uploads/...` paths cannot be recovered from disk).
3. Confirm Render logs show: `[fileStorage] Uploads persist in MongoDB GridFS`

New uploads will be stored as `gridfs://...` in the database and served via `/api/files/<id>`.

---

## Still Not Working?

1. **Check browser console** - Look for the exact error message
2. **Check Network tab** - See what URL the request is trying to reach
3. **Check Render logs** - See if requests are reaching the backend
4. **Verify environment variables** - Make sure they're set correctly in both Vercel and Render
