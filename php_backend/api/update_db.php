<?php
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

try {
    $sql = "ALTER TABLE talent_profiles ADD COLUMN profile_picture LONGTEXT AFTER profile_photo_url;";
    $stmt = $db->prepare($sql);
    $stmt->execute();
    echo json_encode(["message" => "Successfully added profile_picture column to talent_profiles table!"]);
} catch (PDOException $e) {
    if ($e->getCode() == '42S21') { // 42S21 = Duplicate column name
        echo json_encode(["message" => "Column profile_picture already exists."]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Error adding column.", "error" => $e->getMessage()]);
    }
}
?>
