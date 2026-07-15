<?php
include_once './config/database.php';

$database = new Database();
$db = $database->getConnection();

// Check if column exists
$checkQuery = "SHOW COLUMNS FROM blogs LIKE 'author_name'";
$stmt = $db->prepare($checkQuery);
$stmt->execute();

if ($stmt->rowCount() == 0) {
    // Add author_name column
    $query = "ALTER TABLE blogs ADD COLUMN author_name VARCHAR(255) DEFAULT 'Admin'";
    $stmt = $db->prepare($query);
    if ($stmt->execute()) {
        echo "Column author_name added successfully.\n";
    } else {
        echo "Error adding column author_name.\n";
        print_r($stmt->errorInfo());
    }
} else {
    echo "Column author_name already exists.\n";
}
?>