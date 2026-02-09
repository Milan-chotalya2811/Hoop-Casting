<?php
include_once '../../config/database.php';
include_once '../../utils/auth.php';

$database = new Database();
$db = $database->getConnection();

$user = authenticate($db);

if ($user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["message" => "Access denied. Admins only."]);
    exit();
}

$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 1000;

$query = "SELECT t.*, u.name, u.mobile, u.email, u.created_at as user_created_at 
          FROM talent_profiles t 
          JOIN users u ON t.user_id = u.id 
          ORDER BY t.created_at DESC LIMIT :limit";

$stmt = $db->prepare($query);
$stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
$stmt->execute();

$talents = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($talents);
?>