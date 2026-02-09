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

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    // List all blogs for admin
    $query = "SELECT * FROM blogs ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($rows);
} elseif ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->title)) {
        http_response_code(400);
        echo json_encode(["message" => "Title is required."]);
        exit();
    }

    $title = $data->title;
    $slug = isset($data->slug) && !empty($data->slug) ? $data->slug : strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
    $content = isset($data->content) ? $data->content : '';
    $image_url = isset($data->image_url) ? $data->image_url : '';
    $meta_title = isset($data->meta_title) ? $data->meta_title : '';
    $meta_description = isset($data->meta_description) ? $data->meta_description : '';
    $keywords = isset($data->keywords) ? $data->keywords : '';

    $author_name = isset($user['name']) ? $user['name'] : 'Admin';
    $query = "INSERT INTO blogs (title, slug, content, image_url, meta_title, meta_description, keywords, author_name) VALUES (:title, :slug, :content, :image_url, :meta_title, :meta_description, :keywords, :author_name)";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":title", $title);
    $stmt->bindParam(":slug", $slug);
    $stmt->bindParam(":content", $content);
    $stmt->bindParam(":image_url", $image_url);
    $stmt->bindParam(":meta_title", $meta_title);
    $stmt->bindParam(":meta_description", $meta_description);
    $stmt->bindParam(":keywords", $keywords);
    $stmt->bindParam(":author_name", $author_name);

    try {
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Blog created successfully.", "id" => $db->lastInsertId()]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to create blog."]);
        }
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(["message" => "Error: " . $e->getMessage()]);
    }
} elseif ($method == 'PUT') {
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->id)) {
        http_response_code(400);
        echo json_encode(["message" => "ID is required."]);
        exit();
    }

    $id = $data->id;
    $title = $data->title;
    $slug = isset($data->slug) && !empty($data->slug) ? $data->slug : strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
    $content = $data->content;
    $image_url = $data->image_url;
    $meta_title = $data->meta_title;
    $meta_description = $data->meta_description;
    $keywords = $data->keywords;

    $query = "UPDATE blogs SET title = :title, slug = :slug, content = :content, image_url = :image_url, meta_title = :meta_title, meta_description = :meta_description, keywords = :keywords WHERE id = :id";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":title", $title);
    $stmt->bindParam(":slug", $slug);
    $stmt->bindParam(":content", $content);
    $stmt->bindParam(":image_url", $image_url);
    $stmt->bindParam(":meta_title", $meta_title);
    $stmt->bindParam(":meta_description", $meta_description);
    $stmt->bindParam(":keywords", $keywords);
    $stmt->bindParam(":id", $id);

    try {
        if ($stmt->execute()) {
            echo json_encode(["message" => "Blog updated successfully."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to update blog."]);
        }
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(["message" => "Error: " . $e->getMessage()]);
    }
} elseif ($method == 'DELETE') {
    $id = isset($_GET['id']) ? $_GET['id'] : null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(["message" => "ID is required."]);
        exit();
    }

    $query = "DELETE FROM blogs WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $id);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Blog deleted successfully."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to delete blog."]);
    }
}
?>