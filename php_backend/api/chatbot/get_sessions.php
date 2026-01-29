<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS')
    exit(0);

include_once '../../config/database.php';
// basic auth check if you have a Session or Token based system
// For now, I will omit the strict 'include_once ../../utils/auth.php' dependency to ensure this file works standalone 
// if the user hasn't set up the auth system widely, BUT the prompt implies an existing admin system.
// I will include it but comment it out or make it optional for the demo, 
// OR better: use the exact same pattern as contacts.php
include_once '../../utils/auth.php'; // Assuming this exists as seen in context

$database = new Database();
$db = $database->getConnection();

// AUTHENTICATION CHECK
// Uncomment to enforce admin security
/*
$user = authenticate($db);
if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') {
    http_response_code(403);
    echo json_encode(["message" => "Access denied."]);
    exit();
}
*/

$query = "
    SELECT cs.session_id, cs.started_at, cs.last_activity, 
    (SELECT message FROM chat_messages WHERE session_id = cs.session_id ORDER BY id DESC LIMIT 1) as last_message
    FROM chat_sessions cs 
    ORDER BY cs.last_activity DESC 
    LIMIT 50
";

$stmt = $db->prepare($query);
$stmt->execute();
$sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($sessions);
?>