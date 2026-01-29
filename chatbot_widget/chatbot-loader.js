(function () {
    // --- Configuration ---
    // User can override these by defining window.HOOP_CHAT_OPTIONS before loading this script
    const config = Object.assign({
        // UPDATE THESE URLS TO YOUR LIVE SERVER URLS
        chatEndpoint: 'http://localhost/php_backend/api/chatbot/chat.php',
        historyEndpoint: 'http://localhost/php_backend/api/chatbot/get_history.php',
        logoUrl: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png',
        title: 'Hoop Casting Assistant',
        subtitle: 'Ask me anything about casting!',
        primaryColor: '#ff4757',
        welcomeMessage: 'Hi 👋 Main aapki casting website ka AI assistant hoon. Aap kya jaana chahoge?'
    }, window.HOOP_CHAT_OPTIONS || {});

    // --- State ---
    let sessionId = localStorage.getItem('hoop_chat_session_id');
    let isOpen = false;
    let isTyping = false;

    // --- Inject CSS ---
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'chatbot-style.css'; // Expecting CSS in same folder relative to generic usage? 
    // Ideally this should be an absolute URL in production. 
    // For now we assume local dev or user fixes path.
    // If we are running this from a specific page, we might need to adjust.
    // We will inject styles directly via JS to avoid path issues? No, too much text.
    // Let's assume standard deployment.
    document.head.appendChild(link);

    // --- Create DOM Elements ---
    const widgetHTML = `
        <div id="hoop-chat-trigger" title="Chat with AI">
            <img src="${config.logoUrl}" alt="AI" />
        </div>
        <div id="hoop-chat-window">
            <div class="hoop-chat-header" style="background: ${config.primaryColor};">
                <div class="hoop-chat-title">
                    <h3>${config.title}</h3>
                    <span>${config.subtitle}</span>
                </div>
                <button class="hoop-chat-close">&times;</button>
            </div>
            <div class="hoop-chat-messages" id="hoop-chat-msgs">
                <!-- Messages go here -->
            </div>
            <div class="hoop-chat-input-area">
                <input type="text" id="hoop-chat-input" placeholder="Type your doubt..." />
                <button id="hoop-chat-send-btn">
                    <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                </button>
            </div>
        </div>
    `;

    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'hoop-chat-container';
    widgetContainer.innerHTML = widgetHTML;
    document.body.appendChild(widgetContainer);

    // --- Selectors ---
    const triggerBtn = document.getElementById('hoop-chat-trigger');
    const closeBtn = document.querySelector('.hoop-chat-close');
    const chatWindow = document.getElementById('hoop-chat-window');
    const msgContainer = document.getElementById('hoop-chat-msgs');
    const inputField = document.getElementById('hoop-chat-input');
    const sendBtn = document.getElementById('hoop-chat-send-btn');

    // --- Helper Functions ---

    function scrollToBottom() {
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    function toggleChat() {
        isOpen = !isOpen;
        if (isOpen) {
            chatWindow.classList.add('active');
            inputField.focus();
            if (window.innerWidth < 480) {
                document.body.style.overflow = 'hidden'; // Disable scroll on mobile
            }
            if (!msgContainer.hasChildNodes() && !sessionId) {
                // First time ever
                appendMessage('bot', config.welcomeMessage);
            }
            loadHistory();
        } else {
            chatWindow.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function appendMessage(sender, text) {
        // Prevent duplicate temporary messages if needed by using IDs, but simple append is fine for now
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender}`;
        msgDiv.innerHTML = text.replace(/\n/g, '<br>');
        msgContainer.appendChild(msgDiv);
        scrollToBottom();
    }

    function showTyping() {
        if (isTyping) return;
        isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'hoop-typing';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        msgContainer.appendChild(typingDiv);
        scrollToBottom();
    }

    function hideTyping() {
        const el = document.getElementById('hoop-typing');
        if (el) el.remove();
        isTyping = false;
    }

    async function sendMessage() {
        const text = inputField.value.trim();
        if (!text) return;

        inputField.value = '';
        appendMessage('user', text);
        showTyping();

        try {
            const payload = {
                message: text,
                session_id: sessionId
            };

            const response = await fetch(config.chatEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.session_id) {
                sessionId = data.session_id;
                localStorage.setItem('hoop_chat_session_id', sessionId);
            }

            hideTyping();

            if (data.reply) {
                appendMessage('bot', data.reply);
            } else if (data.error) {
                appendMessage('bot', "Error: " + data.error);
            }

        } catch (e) {
            hideTyping();
            appendMessage('bot', "Sorry, network error. Please try again.");
            console.error(e);
        }
    }

    async function loadHistory() {
        if (!sessionId) return;
        // Check if we already loaded (simple check: if container has kids)
        // Ideally we should reload to get latest, but prevent duplicates.
        // For this demo: fetch only if empty.
        if (msgContainer.children.length > 1) return; // >1 because logic might have added welcome message

        try {
            msgContainer.innerHTML = ''; // Clear for fresh load
            // Determine API URL (construct query param)
            const url = `${config.historyEndpoint}?session_id=${sessionId}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.history && Array.isArray(data.history)) {
                data.history.forEach(item => {
                    const sender = item.sender === 'user' ? 'user' : 'bot';
                    appendMessage(sender, item.message);
                });
            } else {
                appendMessage('bot', config.welcomeMessage);
            }
        } catch (e) {
            console.error("Failed to load history", e);
        }
    }

    // --- Event Bindings ---
    triggerBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    sendBtn.addEventListener('click', sendMessage);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

})();
