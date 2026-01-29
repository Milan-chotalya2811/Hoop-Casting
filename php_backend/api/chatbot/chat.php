<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include_once '../../config/database.php';

// Load Knowledge Base
$kb_path = __DIR__ . '/data.json';
$kb_data = file_exists($kb_path) ? json_decode(file_get_contents($kb_path), true) : [];
$system_instruction = $kb_data['system_instruction'] ?? "You are a helpful assistant.";
$context_content = $kb_data['context'] ?? "";

// Database Connection
$database = new Database();
$db = $database->getConnection();

// Get Input
$input = json_decode(file_get_contents("php://input"), true);
$message = $input['message'] ?? '';
$session_id = $input['session_id'] ?? null;

if (empty($message)) {
    echo json_encode(['error' => 'Message is required']);
    exit;
}

// Manage Session
if (!$session_id) {
    $session_id = uniqid('chat_', true);
    $stmt = $db->prepare("INSERT INTO chat_sessions (session_id) VALUES (:id)");
    $stmt->execute([':id' => $session_id]);
} else {
    // Verify or Create if missing (resilience)
    $stmt = $db->prepare("INSERT IGNORE INTO chat_sessions (session_id) VALUES (:id)");
    $stmt->execute([':id' => $session_id]);
    $stmt = $db->prepare("UPDATE chat_sessions SET last_activity = NOW() WHERE session_id = :id");
    $stmt->execute([':id' => $session_id]);
}

// Save User Message
$stmt = $db->prepare("INSERT INTO chat_messages (session_id, sender, message) VALUES (:sess, 'user', :msg)");
$stmt->execute([':sess' => $session_id, ':msg' => $message]);

// Fetch History for Context (Last 6 messages)
$stmt = $db->prepare("SELECT sender, message FROM chat_messages WHERE session_id = :sess ORDER BY id DESC LIMIT 6");
$stmt->execute([':sess' => $session_id]);
$history = array_reverse($stmt->fetchAll(PDO::FETCH_ASSOC));

// Construct Prompt for AI
$messages_payload = [
    ['role' => 'system', 'content' => $system_instruction . "\n\nCONTEXT:\n" . $context_content]
];

foreach ($history as $chat) {
    $role = ($chat['sender'] == 'user') ? 'user' : 'assistant';
    $messages_payload[] = ['role' => $role, 'content' => $chat['message']];
}

// Generate Response
$bot_response = "I am currently in demo mode. Please configure the OpenAI API key in chat.php to enable full intelligence.";

// --- OPENAI INTEGRATION START ---
// Load credentials securely
if (file_exists(__DIR__ . '/secrets.php')) {
    include_once __DIR__ . '/secrets.php';
} else {
    $openai_api_key = getenv('OPENAI_API_KEY'); // Fallback to env var
}

if (isset($openai_api_key) && !empty($openai_api_key)) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.openai.com/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'model' => 'gpt-3.5-turbo', // or gpt-4
        'messages' => $messages_payload,
        'temperature' => 0.7
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $openai_api_key
    ]);

    $result = curl_exec($ch);
    if (curl_errno($ch)) {
        $bot_response = "Error communicating with AI service.";
    } else {
        $response_data = json_decode($result, true);
        if (isset($response_data['choices'][0]['message']['content'])) {
            $bot_response = $response_data['choices'][0]['message']['content'];
        } else {
            // Fallback if API usage limit or other error
            $bot_response = "Sorry, I am having trouble connecting to the brain right now.";
        }
    }
    curl_close($ch);
} else {
    // SIMPLE FALLBACK RESPONSE (Rule Based)
    // You can remove this else block once OpenAI is set up.
    if (stripos($message, 'hi') !== false || stripos($message, 'hello') !== false) {
        $bot_response = "Hi! user, I am your Hoop Casting assistant. How can I help you today?";
    } else if (stripos($message, 'contact') !== false) {
        $bot_response = "You can contact our team at support@hoopcasting.com.";
    } else {
        $bot_response = "I received your message: '$message'. (Please Setup OpenAI Key)";
    }
}
// --- OPENAI INTEGRATION END ---

// Save Bot Response
$stmt = $db->prepare("INSERT INTO chat_messages (session_id, sender, message) VALUES (:sess, 'bot', :msg)");
$stmt->execute([':sess' => $session_id, ':msg' => $bot_response]);

echo json_encode([
    'session_id' => $session_id,
    'reply' => $bot_response
]);
?>