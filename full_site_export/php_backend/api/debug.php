<?php
// Debug script to check server configuration
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

echo json_encode([
    "status" => "Server is working!",
    "php_version" => phpversion(),
    "server_software" => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    "request_method" => $_SERVER['REQUEST_METHOD'] ?? 'Unknown',
    "headers_sent" => headers_sent(),
    "time" => date('Y-m-d H:i:s')
]);
?>