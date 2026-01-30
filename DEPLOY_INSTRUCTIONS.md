# Hybrid Deployment Setup (Vercel + Hostinger)

Since you are hosting the **Frontend on Vercel** and the **Backend on Hostinger**, the setup is split:

## 1. Frontend (Vercel)
- Vercel automatically deploys your `frontend` folder when you push to GitHub.
- **Action Required:** Ensure Vercel is connected to your GitHub Repo and Root Directory is set to `frontend`.
- **Environment Variable:** In Vercel Project Settings > Environment Variables, add:
  - `NEXT_PUBLIC_API_URL`: `https://api.hoopcasting.com/api` (See Step 3)

## 2. Backend (Hostinger)
- The GitHub Action in this repo will automatically upload the `php_backend` folder to your Hostinger server via FTP when you push changes.
- **Action Required:** Ensure your GitHub Repository Secrets (`FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`) are set.

## 3. Important: Connect Frontend to Backend
Since your main domain (`hoopcasting.com`) points to Vercel, it cannot reach the PHP files on Hostinger anymore.
You MUST create a **Subdomain** for the backend.

1. Go to your Domain DNS Settings (where you bought the domain).
2. Add an **A Record**:
   - **Host/Name:** `api`
   - **Value/Points to:** `[Your Hostinger Server IP Address]`
3. Now your backend will be accessible at `https://api.hoopcasting.com/php_backend`.
4. Update your Frontend `.env.local` or Vercel Env Vars to point to this new URL.

