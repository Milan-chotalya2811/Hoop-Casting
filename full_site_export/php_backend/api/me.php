<?php
include_once '../config/database.php';
include_once '../utils/auth.php';

$database = new Database();
$db = $database->getConnection();

$user = authenticate($db);

// Fetch full user details
$query = "SELECT id, name, mobile, email, role, created_at FROM users WHERE id = :id LIMIT 1";
$stmt = $db->prepare($query);
$stmt->bindParam(':id', $user['id']);
$stmt->execute();

$userData = $stmt->fetch(PDO::FETCH_ASSOC);

if ($userData) {
    echo json_encode($userData);
} else {
    http_response_code(404);
    echo json_encode(["message" => "User not found."]);
}
?>