<?php
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    // Public Talent List
    // Filters: category, limit, offset, search?

    $category = isset($_GET['category']) ? $_GET['category'] : null;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;

    $query = "SELECT t.id, t.user_id, t.category, t.city, t.state, t.profile_photo_url, t.years_experience, u.name 
              FROM talent_profiles t 
              JOIN users u ON t.user_id = u.id 
              WHERE t.deleted_at IS NULL AND t.is_hidden = 0";

    if ($category) {
        $query .= " AND t.category LIKE :category";
    }

    $query .= " ORDER BY t.created_at DESC LIMIT :limit";

    $stmt = $db->prepare($query);

    if ($category) {
        $catParam = "%$category%";
        $stmt->bindParam(':category', $catParam);
    }
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);

    $stmt->execute();

    $talents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($talents);
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
}
?>