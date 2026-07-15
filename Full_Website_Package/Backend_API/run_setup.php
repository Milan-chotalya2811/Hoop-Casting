<?php
include_once './config/database.php';

$database = new Database();
$db = $database->getConnection();

$sql = file_get_contents("./setup_chatbot.sql");

try {
    $db->exec($sql);
    echo "Chatbot tables created successfully.";
} catch (PDOException $e) {
    echo "Error creating tables: " . $e->getMessage();
}
?>