<?php
require_once 'config.php';

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (empty($input['mobile']) || empty($input['password'])) {
    sendJSON([
        "status" => "error",
        "message" => "Mobile and password are required"
    ], 400);
}

try {
    $db = getDB();

    // Get user by mobile
    $stmt = $db->prepare("SELECT * FROM users WHERE mobile = ?");
    $stmt->execute([$input['mobile']]);
    $user = $stmt->fetch();

    if (!$user) {
        sendJSON([
            "status" => "error",
            "message" => "Invalid mobile or password"
        ], 401);
    }

    // Verify password
    if (!password_verify($input['password'], $user['password_hash'])) {
        sendJSON([
            "status" => "error",
            "message" => "Invalid mobile or password"
        ], 401);
    }

    // Generate new token if needed
    if (empty($user['api_token'])) {
        $apiToken = bin2hex(random_bytes(32));
        $stmt = $db->prepare("UPDATE users SET api_token = ? WHERE id = ?");
        $stmt->execute([$apiToken, $user['id']]);
    } else {
        $apiToken = $user['api_token'];
    }

    // Return success
    sendJSON([
        "status" => "success",
        "message" => "Login successful",
        "token" => $apiToken,
        "user" => [
            "id" => $user['id'],
            "name" => $user['name'],
            "mobile" => $user['mobile'],
            "email" => $user['email'],
            "role" => $user['role'] ?? 'user'
        ]
    ], 200);

} catch (PDOException $e) {
    sendJSON([
        "status" => "error",
        "message" => "Login failed",
        "error" => $e->getMessage()
    ], 500);
}
?>