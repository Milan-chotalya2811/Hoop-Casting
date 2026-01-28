<?php
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->name) && !empty($data->email) && !empty($data->message)) {
        $query = "INSERT INTO contact_messages (name, email, subject, message) VALUES (:name, :email, :subject, :message)";
        $stmt = $db->prepare($query);

        $data->name = htmlspecialchars(strip_tags($data->name));
        $data->email = htmlspecialchars(strip_tags($data->email));
        $data->subject = !empty($data->subject) ? htmlspecialchars(strip_tags($data->subject)) : 'General Inquiry';
        $data->message = htmlspecialchars(strip_tags($data->message));

        $stmt->bindParam(":name", $data->name);
        $stmt->bindParam(":email", $data->email);
        $stmt->bindParam(":subject", $data->subject);
        $stmt->bindParam(":message", $data->message);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Message sent successfully."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to send message."]);
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