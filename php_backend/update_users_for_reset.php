<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
include_once './config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "<h2>Updating Users Table for Password Reset</h2>";

try {
    // Add reset_token column
    $sql1 = "ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL AFTER role";
    $db->exec($sql1);
    echo "<p style='color:green'>Added 'reset_token' column.</p>";
} catch (Exception $e) {
    echo "<p style='color:orange'>reset_token: " . $e->getMessage() . "</p>";
}

try {
    // Add reset_expires_at column
    $sql2 = "ALTER TABLE users ADD COLUMN reset_expires_at TIMESTAMP NULL AFTER reset_token";
    $db->exec($sql2);
    echo "<p style='color:green'>Added 'reset_expires_at' column.</p>";
} catch (Exception $e) {
    echo "<p style='color:orange'>reset_expires_at: " . $e->getMessage() . "</p>";
}

echo "<h3>✅ Update Complete.</h3>";
?>