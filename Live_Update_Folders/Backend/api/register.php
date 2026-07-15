<?php
// Debugging enabled
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Logging Request
$logFile = 'debug_log.txt';
$rawInput = file_get_contents("php://input");
$logMessage = "[" . date('Y-m-d H:i:s') . "] Registration Attempt: " . $rawInput . "\n";
file_put_contents($logFile, $logMessage, FILE_APPEND);

include_once dirname(__DIR__) . '/config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode($rawInput);

if (
    !empty($data->name) &&
    !empty($data->mobile) &&
    !empty($data->password)
) {
    // Aggressive Sanitization: Remove all invisible whitespace characters
    $name = htmlspecialchars(strip_tags(trim($data->name)));
    $mobile = preg_replace('/\s+/', '', trim($data->mobile));
    $email = !empty($data->email) ? preg_replace('/\s+/', '', strtolower(trim($data->email))) : null;
    $raw_password = trim($data->password); 

    // Check Duplicate
    // If email is empty/null, we only check mobile to avoid matching other users who also have null/empty email
    if (empty($email)) {
        $checkQuery = "SELECT id FROM users WHERE mobile = :mobile LIMIT 1";
        $stmt = $db->prepare($checkQuery);
        $stmt->bindParam(':mobile', $mobile);
    } else {
        $checkQuery = "SELECT id FROM users WHERE mobile = :mobile OR LOWER(email) = :email LIMIT 1";
        $stmt = $db->prepare($checkQuery);
        $stmt->bindParam(':mobile', $mobile);
        $stmt->bindParam(':email', $email);
    }
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "User already exists with this mobile or email."]);
        file_put_contents($logFile, " - REG FAILED: User Exists ($mobile / $email)\n", FILE_APPEND);
        exit();
    }

    // Insert
    $query = "INSERT INTO users (name, mobile, email, password_hash, api_token) VALUES (:name, :mobile, :email, :password_hash, :api_token)";
    $stmt = $db->prepare($query);

    $password_hash = password_hash($raw_password, PASSWORD_BCRYPT);
    $api_token = bin2hex(random_bytes(32));

    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":mobile", $mobile);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":password_hash", $password_hash);
    $stmt->bindParam(":api_token", $api_token);

    if ($stmt->execute()) {
        $user_id = $db->lastInsertId();
        http_response_code(201);
        echo json_encode([
            "status" => "success",
            "message" => "User registered successfully.",
            "token" => $api_token,
            "user" => [
                "id" => (int)$user_id, 
                "name" => $name,
                "mobile" => $mobile,
                "email" => $email,
                "role" => "user"
            ]
        ]);
        file_put_contents($logFile, " - REG SUCCESS: User ID $user_id Created\n", FILE_APPEND);
    } else {
        http_response_code(503);
        echo json_encode(["status" => "error", "message" => "Unable to register user."]);
        file_put_contents($logFile, " - REG FAILED: DB Insert Failed\n", FILE_APPEND);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Incomplete data."]);
    file_put_contents($logFile, " - REG FAILED: Incomplete Data\n", FILE_APPEND);
}
?>