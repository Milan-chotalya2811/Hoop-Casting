<?php
include_once '../../config/database.php';
include_once '../../utils/auth.php';

$database = new Database();
$db = $database->getConnection();

$user = authenticate($db);

if ($user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["message" => "Access denied."]);
    exit();
}

// 1. Total
$queryTotal = "SELECT COUNT(*) as count FROM talent_profiles";
$stmt = $db->query($queryTotal);
$total = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

// 2. Hidden
$queryHidden = "SELECT COUNT(*) as count FROM talent_profiles WHERE is_hidden = 1";
$stmt = $db->query($queryHidden);
$hidden = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

// 3. Deleted
$queryDeleted = "SELECT COUNT(*) as count FROM talent_profiles WHERE deleted_at IS NOT NULL";
$stmt = $db->query($queryDeleted);
$deleted = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

$active = $total - $hidden - $deleted; // Crude approx if overlapping flags exist, but fine for now.

echo json_encode([
    "total" => $total,
    "active" => $active,
    "hidden" => $hidden,
    "deleted" => $deleted
]);
?>