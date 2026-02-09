<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once './config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "<h1>Admin Data Debug</h1>";

// 1. Check Users Table
$stmt = $db->query("SELECT COUNT(*) FROM users");
$user_count = $stmt->fetchColumn();
echo "<p><strong>Total Users:</strong> $user_count</p>";

// 2. Check Talents Table
$stmt = $db->query("SELECT COUNT(*) FROM talent_profiles");
$talent_count = $stmt->fetchColumn();
echo "<p><strong>Total Talents (Raw):</strong> $talent_count</p>";

// 3. Check Joined Data (What Admin API sees)
$query = "SELECT COUNT(*) 
          FROM talent_profiles t 
          JOIN users u ON t.user_id = u.id";
$stmt = $db->query($query);
$joined_count = $stmt->fetchColumn();
echo "<p><strong>Joined Talents (Visible to Admin):</strong> $joined_count</p>";

if ($joined_count == 0 && $talent_count > 0) {
    echo "<h3 style='color:red'>WARNING: Talents exist but are not linked to valid Users!</h3>";
    $stmt = $db->query("SELECT id, user_id FROM talent_profiles LIMIT 5");
    $orphans = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<pre>";
    print_r($orphans);
    echo "</pre>";
}

// 4. Show Last 5 Joined
$query = "SELECT t.id, u.name, u.email FROM talent_profiles t JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC LIMIT 5";
$stmt = $db->query($query);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "<h3>Last 5 Visible Talents:</h3>";
echo "<pre>";
print_r($rows);
echo "</pre>";
?>