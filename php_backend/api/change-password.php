<?php
include_once '../config/database.php';
include_once '../utils/auth.php';

$database = new Database();
$db = $database->getConnection();

$user = authenticate($db);
$user_id = $user['id'];

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->old_password) || !isset($data->new_password)) {
    http_response_code(400);
    echo json_encode(["message" => "Missing parameters"]);
    exit();
}

// 1. Verify Old Password
// We need to fetch the current password hash since authenticate() might not return it (to be safe)
// Or we can query again.
$query = "SELECT password_hash FROM users WHERE id = :id";
$stmt = $db->prepare($query);
$stmt->bindParam(':id', $user_id);
$stmt->execute();
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row || !password_verify($data->old_password, $row['password_hash'])) {
    http_response_code(401);
    echo json_encode(["message" => "Incorrect old password"]);
    exit();
}

// 2. Update to New Password
$new_hash = password_hash($data->new_password, PASSWORD_BCRYPT);

$updateQuery = "UPDATE users SET password_hash = :hash WHERE id = :id";
$updateStmt = $db->prepare($updateQuery);
$updateStmt->bindParam(':hash', $new_hash);
$updateStmt->bindParam(':id', $user_id);

if ($updateStmt->execute()) {
    echo json_encode(["message" => "Password updated successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Failed to update password"]);
}
?>