<?php
include_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();
try {
    $stmt = $db->query("DESCRIBE blogs");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($columns);
} catch (Exception $e) {
    echo $e->getMessage();
}
?>