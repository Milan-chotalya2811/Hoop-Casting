<?php
// Debugging enabled
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Logging Request
$logFile = 'debug_log.txt';
$logMessage = "[" . date('Y-m-d H:i:s') . "] Request Received: " . file_get_contents("php://input") . "\n";
file_put_contents($logFile, $logMessage, FILE_APPEND);

include_once dirname(__DIR__) . '/config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->name) &&
    !empty($data->mobile) &&
    !empty($data->password)
) {
    $data->name = htmlspecialchars(strip_tags(trim($data->name)));
    $data->mobile = htmlspecialchars(strip_tags(trim($data->mobile)));
    $email = !empty($data->email) ? htmlspecialchars(strip_tags(trim($data->email))) : null;

    // Check Duplicate
    $checkQuery = "SELECT id FROM users WHERE mobile = :mobile OR email = :email LIMIT 1";
    $stmt = $db->prepare($checkQuery);
    $stmt->bindParam(':mobile', $data->mobile);
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(["message" => "User already exists."]);
        file_put_contents($logFile, " - User Exists Error\n", FILE_APPEND);
        exit();
    }

    // Insert
    $query = "INSERT INTO users (name, mobile, email, password_hash, api_token) VALUES (:name, :mobile, :email, :password_hash, :api_token)";
    $stmt = $db->prepare($query);

    $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
    $api_token = bin2hex(random_bytes(32));

    $stmt->bindParam(":name", $data->name);
    $stmt->bindParam(":mobile", $data->mobile);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":password_hash", $password_hash);
    $stmt->bindParam(":api_token", $api_token);

    if ($stmt->execute()) {
        $user_id = $db->lastInsertId();
        http_response_code(201);
        echo json_encode([
            "message" => "User registered successfully.",
            "token" => $api_token,
            "user" => ["id" => $user_id, "name" => $data->name]
        ]);
        file_put_contents($logFile, " - SUCCESS: User ID $user_id Created\n", FILE_APPEND);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to register user."]);
        file_put_contents($logFile, " - DB Insert Failed\n", FILE_APPEND);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
    file_put_contents($logFile, " - Incomplete Data Error\n", FILE_APPEND);
}
?>