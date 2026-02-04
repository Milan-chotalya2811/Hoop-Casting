<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
include_once './config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "<h2>Database Health Check</h2>";

$tables = ['users', 'talent_profiles', 'contact_messages', 'blogs'];

foreach ($tables as $t) {
    try {
        $check = $db->query("SELECT COUNT(*) FROM $t");
        $count = $check->fetchColumn();
        echo "<p style='color:green'>✅ Table <b>$t</b> exists. Rows: $count</p>";
    } catch (Exception $e) {
        echo "<p style='color:red'>❌ Table <b>$t</b> MISSING or Error: " . $e->getMessage() . "</p>";
    }
}

echo "<h3>Try Manual Contact Insert</h3>";
echo '<form method="POST">
<input type="text" name="test" value="1" hidden>
Name: <input type="text" name="name" value="Test User"><br>
Email: <input type="text" name="email" value="test@test.com"><br>
Mobile: <input type="text" name="mobile" value="1234567890"><br>
Msg: <input type="text" name="message" value="Hello"><br>
<button type="submit">Test Insert</button>
</form>';

if (isset($_POST['test'])) {
    $sql = "INSERT INTO contact_messages (name, email, mobile, subject, message, created_at) VALUES (?, ?, ?, 'Test', ?, NOW())";
    $stmt = $db->prepare($sql);
    try {
        $stmt->execute([$_POST['name'], $_POST['email'], $_POST['mobile'], $_POST['message']]);
        echo "<h3 style='color:green'>Insert SUCCESS! Contact form backend is working.</h3>";
    } catch (Exception $e) {
        echo "<h3 style='color:red'>Insert FAILED: " . $e->getMessage() . "</h3>";
    }
}
?>