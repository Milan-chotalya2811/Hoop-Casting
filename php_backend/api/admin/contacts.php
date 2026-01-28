<?php
include_once '../../config/database.php';
include_once '../../utils/auth.php';

$database = new Database();
$db = $database->getConnection();

$user = authenticate($db);

if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') {
    http_response_code(403);
    echo json_encode(["message" => "Access denied."]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $query = "SELECT * FROM contact_messages ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($messages);
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed."]);
}
?>