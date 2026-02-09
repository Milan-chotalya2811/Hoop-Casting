<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include_once '../../config/database.php';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->userId) || empty($data->email)) {
    http_response_code(400);
    echo json_encode(["message" => "User ID and Email are required."]);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Generate Token
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

    // Save to DB
    $query = "UPDATE users SET reset_token = :token, reset_expires_at = :expires WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':token', $token);
    $stmt->bindParam(':expires', $expires);
    $stmt->bindParam(':id', $data->userId);
    $stmt->execute();

    // Construct Link
    // Determine protocol and host
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    // Assuming the frontend is at the root or /frontend/out/
    // We'll try to guess, but providing the raw link in response is safest for Admin
    $resetLink = "$protocol://$host/reset-password?token=$token";

    // Also try to send email
    $to = $data->email;
    $subject = "Password Reset Request";
    $message = "Click here to reset your password: " . $resetLink;
    $headers = "From: noreply@hoopcasting.com";

    $mailSent = mail($to, $subject, $message, $headers);

    http_response_code(200);
    echo json_encode([
        "message" => $mailSent ? "Email sent successfully." : "Email sending failed, but link generated.",
        "resetLink" => $resetLink // Return link to Admin so they can manually send if needed
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error: " . $e->getMessage()]);
}
?>