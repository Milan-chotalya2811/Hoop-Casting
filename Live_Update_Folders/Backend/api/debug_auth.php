<?php
// Debug script to check if Authorization header is being received
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$debug = [];
$debug['method'] = $_SERVER['REQUEST_METHOD'];

// 1. Check getallheaders() if available
if (function_exists('getallheaders')) {
    $debug['getallheaders'] = getallheaders();
} else {
    $debug['getallheaders'] = "Function not available";
}

// 2. Check $_SERVER variables where Auth header typically hides
$debug['server_vars'] = [
    'HTTP_AUTHORIZATION' => isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : 'MISSING',
    'REDIRECT_HTTP_AUTHORIZATION' => isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION']) ? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] : 'MISSING',
    'Authorization' => isset($_SERVER['Authorization']) ? $_SERVER['Authorization'] : 'MISSING',
    'REMOTE_USER' => isset($_SERVER['REMOTE_USER']) ? $_SERVER['REMOTE_USER'] : 'MISSING'
];

echo json_encode($debug, JSON_PRETTY_PRINT);
?>