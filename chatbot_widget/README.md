# Hoop Casting Chatbot Integration Guide

## 1. Overview
This is a standalone AI Chatbot widget that can be added to any website (HTML, PHP, WordPress, React, etc.). It connects to a PHP backend to store conversations and generate AI responses.

## 2. Server Setup (Hostinger / PHP Hosting)

1.  **Upload Backend Files**:
    *   Upload the `php_backend/api/chatbot` folder to your server's `api` directory (e.g., `public_html/api/chatbot`).
    *   Ensure `php_backend/config/database.php` exists and has correct DB credentials.

2.  **Database Setup**:
    *   Go to phpMyAdmin.
    *   Import `php_backend/setup_chatbot.sql`.
    *   This creates `chat_sessions` and `chat_messages` tables.

3.  **Configure AI**:
    *   Open `api/chatbot/chat.php`.
    *   Find the line `$openai_api_key = "..."`.
    *   Enter your OpenAI API Key (starts with `sk-`).
    *   Edit `api/chatbot/data.json` to update the "Training Data" (Knowledge Base) for your website.

## 3. Frontend Integration (Adding to Website)

You can add this chatbot to any page by including the Script and Style.

### Method A: HTML / PHP Website
Add this code before the closing `</body>` tag of your site (e.g., `footer.php` or `index.html`):

```html
<link rel="stylesheet" href="https://yourwebsite.com/path/to/chatbot-style.css">
<script>
    window.HOOP_CHAT_OPTIONS = {
        chatEndpoint: 'https://yourwebsite.com/api/chatbot/chat.php',
        historyEndpoint: 'https://yourwebsite.com/api/chatbot/get_history.php',
        title: 'Hoop AI',
        logoUrl: 'https://yourwebsite.com/assets/logo.png'
    };
</script>
<script src="https://yourwebsite.com/path/to/chatbot-loader.js"></script>
```

### Method B: Next.js / React
1.  Copy `chatbot-loader.js` and `chatbot-style.css` to `public/chatbot/`.
2.  In your `layout.tsx` or main component:

```jsx
import Script from 'next/script';
import '../public/chatbot/chatbot-style.css'; // Or standard import

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script 
          src="/chatbot/chatbot-loader.js" 
          strategy="lazyOnload"
          onLoad={() => {
             window.HOOP_CHAT_OPTIONS = {
                chatEndpoint: 'https://api.yourdomain.com/chatbot/chat.php',
                historyEndpoint: 'https://api.yourdomain.com/chatbot/get_history.php'
             };
          }}
        />
      </body>
    </html>
  );
}
```

## 4. Customization

*   **Colors**: Edit `chatbot-style.css` > `:root` variables.
*   **Logo/Text**: Edit `window.HOOP_CHAT_OPTIONS` in the script tag.
*   **Knowledge Base**: Edit `api/chatbot/data.json`.

## 5. Security Note
*   The API currently allows all origins (`Access-Control-Allow-Origin: *`) to let you test easily.
*   For production security, change `*` to your specific domain in `chat.php`.
