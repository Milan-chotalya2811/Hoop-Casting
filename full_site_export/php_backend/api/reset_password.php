<?php
// Enable Error Reporting
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
} catch (Exception $e) {
    echo json_encode(["message" => "Connection Error: " . $e->getMessage()]);
    exit();
}

$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput);

if (!empty($data->token) && !empty($data->password)) {
    $token = htmlspecialchars(strip_tags($data->token));
    $password = htmlspecialchars(strip_tags($data->password));

    try {
        // Step 1: Verify Token
        $query = "SELECT id FROM users WHERE reset_token = :token AND reset_expires_at > NOW() LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':token', $token);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            $userId = $user['id'];

            // Hash password
            $password_hash = password_hash($password, PASSWORD_BCRYPT);

            // Step 2: Update Correct Column (password_hash)
            // Note: We update both 'password' (ghost column if exists) and 'password_hash' (actual logic) to be safe
            // But primarily password_hash is what login.php checks

            $updateQuery = "UPDATE users SET password_hash = :password_hash, password = :password_hash, reset_token = NULL, reset_expires_at = NULL WHERE id = :id";
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->bindParam(':password_hash', $password_hash);
            $updateStmt->bindParam(':id', $userId);

            if ($updateStmt->execute()) {
                http_response_code(200);
                echo json_encode(["message" => "Password reset successfully."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Execute returned false."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Invalid or expired token."]);
        }

    } catch (PDOException $e) {
        // If password_hash doesn't exist (unlikely given register.php works), we catch and try fallback or report error
        http_response_code(500);
        echo json_encode(["message" => "SQL Error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
}
?>