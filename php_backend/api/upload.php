<?php
include_once '../config/database.php';

// Check if file is provided
if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(["message" => "No file uploaded."]);
    exit();
}

$target_dir = "../uploads/";
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0777, true);
}

$file_name = basename($_FILES["file"]["name"]);
$file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
$new_file_name = uniqid() . '.' . $file_ext;
$target_file = $target_dir . $new_file_name;

$allowed_extensions = ["jpg", "jpeg", "png", "gif", "mp4", "mov", "pdf"];

if (!in_array($file_ext, $allowed_extensions)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid file type."]);
    exit();
}

if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
    http_response_code(200);
    // Return path relative to domain root. Assuming 'php_backend' is the root or aliased.
    // If php_backend is in root, then url is /uploads/filename
    echo json_encode([
        "message" => "File uploaded successfully.",
        "url" => "/uploads/" . $new_file_name,
        "type" => $file_ext
    ]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Error uploading file."]);
}
?>