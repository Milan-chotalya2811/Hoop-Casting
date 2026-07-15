<?php
include_once '../config/database.php';
include_once '../utils/auth.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $user = authenticate($db); // Require Login
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->rating) && !empty($data->comment)) {
        $query = "INSERT INTO feedback (user_id, rating, comment) VALUES (:user_id, :rating, :comment)";
        $stmt = $db->prepare($query);

        $data->comment = htmlspecialchars(strip_tags($data->comment));

        $stmt->bindParam(":user_id", $user['id']);
        $stmt->bindParam(":rating", $data->rating);
        $stmt->bindParam(":comment", $data->comment);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Feedback submitted successfully."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to submit feedback."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed."]);
}
?>