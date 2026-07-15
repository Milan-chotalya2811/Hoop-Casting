<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once dirname(__DIR__) . '/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "<h1>Database Connection Successful ✅</h1>";

    // Check Database Name
    $stmt = $db->query("SELECT DATABASE()");
    $dbName = $stmt->fetchColumn();
    echo "<p><strong>Connected to Database:</strong> " . $dbName . "</p>";

    // Count Users
    $stmt = $db->query("SELECT count(*) FROM users");
    $userCount = $stmt->fetchColumn();
    echo "<p><strong>Total Users:</strong> " . $userCount . "</p>";

    // Show Last 5 Users
    $stmt = $db->query("SELECT id, name, mobile, email, created_at FROM users ORDER BY id DESC LIMIT 5");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "<h3>Last 5 Registered Users:</h3>";
    if (count($users) > 0) {
        echo "<table border='1' cellpadding='10'>";
        echo "<tr><th>ID</th><th>Name</th><th>Mobile</th><th>Email</th><th>Created At</th></tr>";
        foreach ($users as $user) {
            echo "<tr>";
            echo "<td>" . $user['id'] . "</td>";
            echo "<td>" . htmlspecialchars($user['name']) . "</td>";
            echo "<td>" . htmlspecialchars($user['mobile']) . "</td>";
            echo "<td>" . htmlspecialchars($user['email']) . "</td>";
            echo "<td>" . $user['created_at'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "No users found.";
    }

} catch (Exception $e) {
    echo "<h1>Connection Failed ❌</h1>";
    echo "Error: " . $e->getMessage();
}
?>