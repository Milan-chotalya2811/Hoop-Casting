<?php
include_once './config/database.php';

$database = new Database();
$db = $database->getConnection();

$query = "CREATE TABLE IF NOT EXISTS blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content LONGTEXT NOT NULL,
    image_url VARCHAR(255),
    meta_title VARCHAR(255),
    meta_description TEXT,
    keywords TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

try {
    $stmt = $db->prepare($query);
    if($stmt->execute()) {
        echo json_encode(["message" => "Blogs table created successfully."]);
    } else {
        echo json_encode(["error" => "Unable to create blogs table."]);
    }
} catch(PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
