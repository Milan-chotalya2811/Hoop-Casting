<?php
// debug_db.php (Improved)
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>🔍 Database Connection Debugger</h1>";

$config_dir = __DIR__ . '/config';
$config_file = $config_dir . '/database.php';

// Check Config Folder
if (!is_dir($config_dir)) {
    echo "<p style='color:red'>❌ FOLDER MISSING: The 'config' folder was not found in " . __DIR__ . "</p>";
} else {
    echo "<p style='color:green'>✅ Folder 'config' exists.</p>";

    echo "<h3>Files inside 'config' folder:</h3><ul>";
    $config_files = scandir($config_dir);
    foreach ($config_files as $f) {
        if ($f != "." && $f != "..")
            echo "<li>$f</li>";
    }
    echo "</ul>";
}

if (!file_exists($config_file)) {
    echo "<p style='color:red'>❌ FILE MISSING: <b>database.php</b> was not found inside the config folder.</p>";
    exit();
}

include_once $config_file;

try {
    $database = new Database();
    $db = $database->getConnection();
    echo "<p style='color:green'>✅ SUCCESS: Database connected successfully!</p>";

    $stmt = $db->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo "<h3>Tables Found:</h3><ul>";
    if (empty($tables))
        echo "<li style='color:orange'>No tables found. Run the SQL!</li>";
    else
        foreach ($tables as $t)
            echo "<li>$t</li>";
    echo "</ul>";
} catch (Exception $e) {
    echo "<p style='color:red'>❌ ERROR: " . $e->getMessage() . "</p>";
}
?>