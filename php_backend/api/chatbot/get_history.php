<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$session_id = $_GET['session_id'] ?? null;

if (!$session_id) {
    echo json_encode(['history' => []]);
    exit;
}

$stmt = $db->prepare("SELECT sender, message, created_at FROM chat_messages WHERE session_id = :sess ORDER BY id ASC");
$stmt->execute([':sess' => $session_id]);
$history = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['history' => $history]);
?>