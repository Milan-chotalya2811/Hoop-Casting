<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include_once '../../config/database.php';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->userId) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(["message" => "User ID and Password are required."]);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $passwordHash = password_hash($data->password, PASSWORD_BCRYPT);

    $query = "UPDATE users SET password_hash = :hash, password = :hash WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':hash', $passwordHash);
    $stmt->bindParam(':id', $data->userId);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(["message" => "Password updated successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Failed to update password."]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error: " . $e->getMessage()]);
}
?>