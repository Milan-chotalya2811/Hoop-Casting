<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once './config/database.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

$response = [];

// 1. Check if table 'blogs' exists
try {
    $result = $db->query("SELECT 1 FROM blogs LIMIT 1");
    $response['table_exists'] = true;
} catch (Exception $e) {
    $response['table_exists'] = false;
    // Create table
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
    $db->exec($query);
    $response['table_created'] = true;
}

// 2. Check and Add 'author_name' column
try {
    $check = $db->query("SHOW COLUMNS FROM blogs LIKE 'author_name'");
    if ($check->rowCount() == 0) {
        $db->query("ALTER TABLE blogs ADD COLUMN author_name VARCHAR(255) DEFAULT 'Admin'");
        $response['column_added'] = "author_name";
    } else {
        $response['column_exists'] = "author_name";
    }
} catch (Exception $e) {
    $response['column_error'] = $e->getMessage();
}

// 3. Count Blogs
$stmt = $db->query("SELECT COUNT(*) FROM blogs");
$count = $stmt->fetchColumn();
$response['blog_count'] = $count;

// 4. Insert Dummy Blog if empty
if ($count == 0) {
    $title = "Welcome to Our New Blog";
    $slug = "welcome-to-our-new-blog-" . time();
    $content = "<p>This is a sample blog post to verify the system is working. You can edit or delete this from the admin panel.</p>";
    $meta_desc = "This is a sample blog post to verify the system is working.";
    $author = "System Admin";

    $query = "INSERT INTO blogs (title, slug, content, meta_description, author_name) VALUES (:title, :slug, :content, :md, :an)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':title', $title);
    $stmt->bindParam(':slug', $slug);
    $stmt->bindParam(':content', $content);
    $stmt->bindParam(':md', $meta_desc);
    $stmt->bindParam(':an', $author);

    if ($stmt->execute()) {
        $response['dummy_inserted'] = true;
    } else {
        $response['dummy_error'] = "Failed to insert";
    }
}

// 5. Fetch Blogs to verify
$stmt = $db->query("SELECT id, title, created_at, author_name FROM blogs ORDER BY created_at DESC LIMIT 5");
$response['blogs'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($response, JSON_PRETTY_PRINT);
?>