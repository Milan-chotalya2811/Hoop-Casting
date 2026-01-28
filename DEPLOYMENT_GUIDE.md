# Deployment Guide to Live Server

This guide explains how to deploy the **Monkey Casting** application to a live server (Shared Hosting or VPS).

## Prerequisites

1.  **Domain & Hosting**: You need a hosting provider (Godaddy, Hostinger, Bluehost, AWS, etc.).
2.  **MySQL Database**: Access to create a database (e.g., via phpMyAdmin).
3.  **File Access**: FTP (FileZilla) or File Manager (cPanel).

---

## 1. Prepare Backend (PHP)

The backend handles the API and Database.

### Step 1.1: Upload Files
1.  Navigate to your server's public folder (usually `public_html`).
2.  Create a folder named `php_backend`.
3.  Upload the **contents** of the local `e:\casting test\php_backend` folder into the `public_html/php_backend` folder on your server.
    *   Result should look like: `yourdomain.com/php_backend/api/login.php`

### Step 1.2: Database Setup
1.  Log in to your hosting's **Database Manager** (phpMyAdmin).
2.  Create a new database (e.g., `monkey_casting_db`).
3.  Click "Import" and select the file: `e:\casting test\php_backend\database.sql`.
4.  Execute the import to create the tables.

### Step 1.3: Configure Database Connection
1.  On your server, open `php_backend/config/database.php`.
2.  Edit the credentials to match your **LIVE** database:

```php
// Example:
private $host = "localhost"; // Usually localhost for shared hosting
private $db_name = "u12345_monkey_casting"; // Your LIVE database name
private $username = "u12345_root"; // Your LIVE database user
private $password = "YourStrongPassword!"; // Your LIVE database password
```
3.  Save the file.

### Step 1.4: Verify Backend
Visit `https://yourdomain.com/php_backend/api/admin/users.php` in your browser.
*   If you see `{"message": "Access denied"}` (or similar JSON), it works!
*   If you see "Database Connection Error", check your config.

---

## 2. Prepare Frontend (Next.js)

The frontend is the visible website.

### Option A: Using a VPS (Node.js Server) - Recommended for Best Performance
1.  Upload the `frontend` folder to your VPS.
2.  Run `npm install`.
3.  Create `.env.local` with: `NEXT_PUBLIC_API_URL=https://yourdomain.com/php_backend/api`
4.  Run `npm run build`.
5.  Run `npm start`.
6.  Use Nginx/Apache to proxy port 3000 to your domain.

### Option B: Shared Hosting (No Node.js) - Static Export
*Note: Some dynamic routing features might require configuration.*

1.  Open `e:\casting test\frontend\next.config.ts`.
2.  Ensure it looks like this:
    ```ts
    const nextConfig: NextConfig = {
      output: 'export', // IMPORTANT: This tells Next.js to build static HTML
      images: { unoptimized: true }, // Required for static export
      // ...
    };
    ```
3.  Run the build command locally:
    ```bash
    cd frontend
    npm run build
    ```
    *(If valid, this creates an `out` folder)*.
4.  Upload the contents of the `out` folder to your `public_html` root (or subdirectory).

**Important Note for Shared Hosting (Routes):**
Since Next.js is an SPA (Single Page App), reload on inner pages (like `/profile/edit`) might give "404 Not Found" on shared hosting.
To fix this, create a `.htaccess` file in `public_html`:

**`.htaccess` content:**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 3. Connect Frontend to Backend

1.  Before building the frontend (Step 2), open `.env.local` in `frontend` folder.
2.  Change the API URL to your live domain:
    ```
    NEXT_PUBLIC_API_URL=https://yourdomain.com/php_backend/api
    ```
3.  Re-run `npm run build` after changing this file.

---

## Summary of URLs

-   **Frontend**: `https://yourdomain.com`
-   **Backend API**: `https://yourdomain.com/php_backend/api`
-   **Uploaded Images**: `https://yourdomain.com/php_backend/uploads`

## 4. Known Limitations / Maintenance Mode

To ensure a smooth migration to the new PHP backend, the following less-critical pages have been temporarily set to "Maintenance Mode":

1.  **Admin > Edit Talent**: Use database directly if edits are needed immediately.
2.  **Admin > Add Talent Manually**: Use the public registration form.
3.  **Feedback & Contact Forms**: Currently show a "Feature Update" message.
4.  **Forgot Password**: Disabled until email service is configured on PHP backend.

**Core features (Register, Login, Edit My Profile, View Profiles, Admin List/Delete/Hide) are FULLY FUNCTIONAL.**
