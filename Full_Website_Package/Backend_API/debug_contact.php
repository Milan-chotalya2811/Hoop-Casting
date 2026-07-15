<?php
include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "<h2>Table Structure: contact_messages</h2>";
try {
    $q = $db->query("DESCRIBE contact_messages");
    $rows = $q->fetchAll(PDO::FETCH_ASSOC);
    echo "<pre>";
    print_r($rows);
    echo "</pre>";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}

echo "<h2>Test Insert</h2>";
// Try a dummy insert
try {
    $query = "INSERT INTO contact_messages (name, email, subject, message) VALUES ('Test', 'test@example.com', 'Test Subject', 'Test Message')";
    $stmt = $db->prepare($query);
    if ($stmt->execute()) {
        echo "Insert SUCCESS";
    } else {
        echo "Insert FAILED";
        print_r($stmt->errorInfo());
    }
} catch (PDOException $e) {
    echo "Insert Exception: " . $e->getMessage();
}
?>