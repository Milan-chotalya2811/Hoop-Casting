<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include_once dirname(__DIR__) . '/config/database.php';

echo "<h1>Direct Database Insert Test</h1>";

try {
    $database = new Database();
    $db = $database->getConnection();
    echo "Database Connected Successfully...<br>";

    // Random Data
    $rand = rand(1000, 9999);
    $name = "TestUser_" . $rand;
    $mobile = "99900" . $rand;
    $email = "test" . $rand . "@demo.com";
    $pass = '$2y$10$dummyhashvalueforpassword123';

    echo "Attempting to insert: <b>$name ($mobile)</b>...<br>";

    // Query
    $sql = "INSERT INTO users (name, mobile, email, password_hash, role) VALUES (:name, :mobile, :email, :pass, 'user')";
    $stmt = $db->prepare($sql);

    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':mobile', $mobile);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':pass', $pass);

    if ($stmt->execute()) {
        $id = $db->lastInsertId();
        echo "<h2 style='color:green'>✅ SUCCESS! Inserted User ID: $id</h2>";
        echo "<p>Ab turant phpMyAdmin me check kare. Agar data waha hai, to Backend 100% sahi hai. Galti Frontend me hai.</p>";
    } else {
        echo "<h2 style='color:red'>❌ Insert Failed</h2>";
        print_r($stmt->errorInfo());
    }

} catch (Exception $e) {
    echo "<h2 style='color:red'>❌ Database Error: " . $e->getMessage() . "</h2>";
}
?>