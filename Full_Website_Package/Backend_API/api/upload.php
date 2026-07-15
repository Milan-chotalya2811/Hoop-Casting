<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if file is provided
if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(["message" => "No file uploaded."]);
    exit();
}

if ($_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(500);
    echo json_encode(["message" => "PHP Upload Error Code: " . $_FILES['file']['error']]);
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

$allowed_extensions = ["jpg", "jpeg", "png", "gif", "mp4", "mov", "webm", "ogg", "avi", "pdf"];

if (!in_array($file_ext, $allowed_extensions)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid file type."]);
    exit();
}

$success = move_uploaded_file($_FILES["file"]["tmp_name"], $target_file);

if ($success) {
    http_response_code(200);
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    $public_url = "/php_backend/uploads/" . $new_file_name;

    echo json_encode([
        "message" => "File uploaded & optimized.",
        "url" => $public_url,
        "type" => $file_ext
    ]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Error uploading or optimizing file."]);
}
?>