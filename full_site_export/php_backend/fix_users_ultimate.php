<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
include_once './config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "<h1>Auto-Fixing Users Table</h1>";

function addColumnIfNotExists($db, $table, $column, $definition)
{
    try {
        $db->query("SELECT $column FROM $table LIMIT 1");
        echo "<p style='color:green'>✅ Column '$column' already exists.</p>";
    } catch (Exception $e) {
        try {
            $db->exec("ALTER TABLE $table ADD COLUMN $column $definition");
            echo "<p style='color:blue'>🛠️ Added column '$column'.</p>";
        } catch (Exception $ex) {
            echo "<p style='color:red'>❌ Failed to add '$column': " . $ex->getMessage() . "</p>";
        }
    }
}

// 1. Ensure 'password' column exists (VARCHAR 255)
addColumnIfNotExists($db, 'users', 'password', 'VARCHAR(255) NOT NULL');

// 2. Ensure 'reset_token' exists
addColumnIfNotExists($db, 'users', 'reset_token', 'VARCHAR(255) NULL');

// 3. Ensure 'reset_expires_at' exists
addColumnIfNotExists($db, 'users', 'reset_expires_at', 'TIMESTAMP NULL');

// 4. Ensure 'api_token' exists (for Auth)
addColumnIfNotExists($db, 'users', 'api_token', 'VARCHAR(255) NULL');

// 5. Ensure 'role' exists
addColumnIfNotExists($db, 'users', 'role', "ENUM('admin', 'user', 'talent', 'super_admin') DEFAULT 'user'");

echo "<h3>✅ Database Structure Fixed.</h3>";
echo "<p>Now try Reset Password functionality again.</p>";
?>