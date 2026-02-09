<?php
include_once '../../config/database.php';
include_once '../../utils/auth.php';

$database = new Database();
$db = $database->getConnection();

$user = authenticate($db);

if ($user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["message" => "Access denied."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (isset($data->action) && isset($data->id)) {
    $table = "talent_profiles";
    $query = "";

    if ($data->action === 'toggle_hidden') {
        // We need current status or just set it. Pass status in body?
        // Or toggle. SQL: NOT is_hidden.
        $query = "UPDATE talent_profiles SET is_hidden = !is_hidden WHERE id = :id";
    } elseif ($data->action === 'delete') {
        $query = "UPDATE talent_profiles SET deleted_at = NOW() WHERE id = :id";
    } elseif ($data->action === 'restore') {
        $query = "UPDATE talent_profiles SET deleted_at = NULL WHERE id = :id";
    }

    if ($query) {
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data->id);
        if ($stmt->execute()) {
            echo json_encode(["message" => "Action successful"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Action failed"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Invalid action"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Missing action or id"]);
}
?>