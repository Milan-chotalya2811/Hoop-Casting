<?php
// Prevent any previous output
ob_start();

// Disable error reporting for final output
error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed"]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    // Read Input
    $rawInput = file_get_contents("php://input");

    // Log for debug (user can check debug_contact.log)
    file_put_contents("debug_contact.log", date("Y-m-d H:i:s") . " - Input: " . $rawInput . "\n", FILE_APPEND);

    $data = json_decode($rawInput);

    if (!$data) {
        ob_clean();
        http_response_code(400);
        echo json_encode(["message" => "Invalid JSON input"]);
        exit();
    }

    if (!empty($data->name) && !empty($data->email) && !empty($data->message)) {

        $name = htmlspecialchars(strip_tags($data->name));
        $email = htmlspecialchars(strip_tags($data->email));
        $mobile = isset($data->mobile) ? htmlspecialchars(strip_tags($data->mobile)) : '';
        $subject = !empty($data->subject) ? htmlspecialchars(strip_tags($data->subject)) : 'General Inquiry';
        $message = htmlspecialchars(strip_tags($data->message));

        if (!empty($data->category)) {
            $category = htmlspecialchars(strip_tags($data->category));
            $message = "Category: $category\n\n" . $message;
        }

        $query = "INSERT INTO contact_messages (name, email, mobile, subject, message, created_at) 
                  VALUES (:name, :email, :mobile, :subject, :message, NOW())";

        $stmt = $db->prepare($query);
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":mobile", $mobile);
        $stmt->bindParam(":subject", $subject);
        $stmt->bindParam(":message", $message);

        if ($stmt->execute()) {
            ob_clean();
            http_response_code(201);
            echo json_encode(["message" => "Message sent successfully."]);
        } else {
            ob_clean();
            http_response_code(503);
            echo json_encode(["message" => "Unable to send message.", "error" => "Execute failed"]);
        }
    } else {
        ob_clean();
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data."]);
    }
} else {
    ob_clean();
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
}
?>