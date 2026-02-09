<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
include_once './config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "<h1>Reset Password Database Setup</h1>";

// Check Categories
try {
    $check = $db->query("SELECT reset_token FROM users LIMIT 1");
    echo "<p style='color:green'>✅ Column 'reset_token' exists.</p>";
} catch (Exception $e) {
    echo "<p style='color:orange'>⚠️ Column 'reset_token' MISSING. Adding...</p>";
    try {
        $db->exec("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL AFTER role");
        echo "<p style='color:green'>✅ Added 'reset_token'.</p>";
    } catch (Exception $ex) {
        echo "<p style='color:red'>❌ Failed to add 'reset_token': " . $ex->getMessage() . "</p>";
    }
}

try {
    $check = $db->query("SELECT reset_expires_at FROM users LIMIT 1");
    echo "<p style='color:green'>✅ Column 'reset_expires_at' exists.</p>";
} catch (Exception $e) {
    echo "<p style='color:orange'>⚠️ Column 'reset_expires_at' MISSING. Adding...</p>";
    try {
        $db->exec("ALTER TABLE users ADD COLUMN reset_expires_at TIMESTAMP NULL AFTER reset_token");
        echo "<p style='color:green'>✅ Added 'reset_expires_at'.</p>";
    } catch (Exception $ex) {
        echo "<p style='color:red'>❌ Failed to add 'reset_expires_at': " . $ex->getMessage() . "</p>";
    }
}

echo "<h3>✅ Setup Check Complete.</h3>";
echo "<p>Try resetting the password again.</p>";
?>