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
    $query = "SELECT f.*, u.name, u.email FROM feedback f LEFT JOIN users u ON f.user_id = u.id ORDER BY f.created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $feedbacks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($feedbacks);
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed."]);
}
?>