<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept");
header("Access-Control-Max-Age: 86400");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    // Validate input
    if (!empty($data->name) && !empty($data->email) && !empty($data->message) && !empty($data->mobile)) {

        // Sanitize input
        $data->name = htmlspecialchars(strip_tags($data->name));
        $data->email = htmlspecialchars(strip_tags($data->email));
        $data->subject = !empty($data->subject) ? htmlspecialchars(strip_tags($data->subject)) : 'General Inquiry';

        // Combine Mobile and Category into the message body
        $mobile = htmlspecialchars(strip_tags($data->mobile));
        $category = !empty($data->category) ? htmlspecialchars(strip_tags($data->category)) : 'Not Specified';
        $original_message = htmlspecialchars(strip_tags($data->message));

        $final_message = "Mobile: " . $mobile . "\n";
        $final_message .= "Category: " . $category . "\n\n";
        $final_message .= "Message:\n" . $original_message;

        // Prepare query (Using original columns only)
        $query = "INSERT INTO contact_messages (name, email, subject, message) VALUES (:name, :email, :subject, :message)";
        $stmt = $db->prepare($query);

        $stmt->bindParam(":name", $data->name);
        $stmt->bindParam(":email", $data->email);
        $stmt->bindParam(":subject", $data->subject);
        $stmt->bindParam(":message", $final_message);

        try {
            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(["message" => "Message sent successfully."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to send message.", "error" => $stmt->errorInfo()]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Database error: " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data. Name, Mobile, Email and Message are required."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed."]);
}
?>