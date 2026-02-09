<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once './config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "<h1>Database Schema Check</h1>";

function describeTable($db, $tableName)
{
    echo "<h3>Table: $tableName</h3>";
    try {
        $q = $db->query("DESCRIBE $tableName");
        $rows = $q->fetchAll(PDO::FETCH_ASSOC);
        echo "<table border='1' cellpadding='5'><tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th></tr>";
        foreach ($rows as $row) {
            echo "<tr>";
            echo "<td>" . $row['Field'] . "</td>";
            echo "<td>" . $row['Type'] . "</td>";
            echo "<td>" . $row['Null'] . "</td>";
            echo "<td>" . $row['Key'] . "</td>";
            echo "<td>" . ($row['Default'] ?? 'NULL') . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } catch (Exception $e) {
        echo "<p style='color:red'>Table $tableName does not exist or error: " . $e->getMessage() . "</p>";
    }
}

describeTable($db, 'users');
describeTable($db, 'talent_profiles');
describeTable($db, 'blogs');

?>