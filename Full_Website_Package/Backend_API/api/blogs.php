<?php
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// Get slug or id from query
$slug = isset($_GET['slug']) ? $_GET['slug'] : null;
$id = isset($_GET['id']) ? $_GET['id'] : null;

if ($method == 'GET') {

    // Check and add author_name column if missing (Migration)
    try {
        $check = $db->query("SHOW COLUMNS FROM blogs LIKE 'author_name'");
        if ($check->rowCount() == 0) {
            $db->query("ALTER TABLE blogs ADD COLUMN author_name VARCHAR(255) DEFAULT 'Admin'");
        }
    } catch (Exception $e) {
        // Ignore error
    }

    if ($slug) {
        // Get single blog by slug
        $query = "SELECT * FROM blogs WHERE slug = :slug LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":slug", $slug);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            echo json_encode($row);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Blog not found."]);
        }
    } else if ($id) {
        // Get single blog by id
        $query = "SELECT * FROM blogs WHERE id = :id LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            echo json_encode($row);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Blog not found."]);
        }
    } else {
        // List all blogs (summary)
        try {
            $query = "SELECT id, title, slug, image_url, meta_description, created_at, author_name FROM blogs ORDER BY created_at DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            // Fallback if author_name column is missing
            $query = "SELECT id, title, slug, image_url, meta_description, created_at FROM blogs ORDER BY created_at DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        echo json_encode($rows);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed."]);
}
?>