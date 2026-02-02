<?php
require_once 'config.php';

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (empty($input['name']) || empty($input['mobile']) || empty($input['password'])) {
    sendJSON([
        "status" => "error",
        "message" => "Name, mobile, and password are required"
    ], 400);
}

// Validate mobile (10 digits)
if (!preg_match('/^[0-9]{10}$/', $input['mobile'])) {
    sendJSON([
        "status" => "error",
        "message" => "Mobile number must be exactly 10 digits"
    ], 400);
}

try {
    $db = getDB();

    // Check if user already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE mobile = ? OR email = ?");
    $stmt->execute([
        $input['mobile'],
        $input['email'] ?? null
    ]);

    if ($stmt->fetch()) {
        sendJSON([
            "status" => "error",
            "message" => "User already exists with this mobile or email"
        ], 400);
    }

    // Hash password
    $passwordHash = password_hash($input['password'], PASSWORD_BCRYPT);

    // Generate API token
    $apiToken = bin2hex(random_bytes(32));

    // Insert user
    $stmt = $db->prepare("
        INSERT INTO users (name, mobile, email, password_hash, api_token, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())
    ");

    $stmt->execute([
        htmlspecialchars(strip_tags($input['name'])),
        $input['mobile'],
        $input['email'] ?? null,
        $passwordHash,
        $apiToken
    ]);

    $userId = $db->lastInsertId();

    // Return success
    sendJSON([
        "status" => "success",
        "message" => "Registration successful",
        "token" => $apiToken,
        "user" => [
            "id" => $userId,
            "name" => $input['name'],
            "mobile" => $input['mobile'],
            "email" => $input['email'] ?? null,
            "role" => "user"
        ]
    ], 201);

} catch (PDOException $e) {
    sendJSON([
        "status" => "error",
        "message" => "Registration failed",
        "error" => $e->getMessage()
    ], 500);
}
?>