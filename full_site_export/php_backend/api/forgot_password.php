<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email)) {
    $email = htmlspecialchars(strip_tags($data->email));

    // Check if email exists
    $query = "SELECT id, name FROM users WHERE email = :email LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Generate Token
        $token = bin2hex(random_bytes(32));
        $expiry = date('Y-m-d H:i:s', strtotime('+1 hour'));

        // Save Token
        $updateQuery = "UPDATE users SET reset_token = :token, reset_expires_at = :expiry WHERE id = :id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':token', $token);
        $updateStmt->bindParam(':expiry', $expiry);
        $updateStmt->bindParam(':id', $user['id']);

        if ($updateStmt->execute()) {

            // Construct Link
            // Assuming frontend is at root domain or localhost
            // For production: https://hoopcasting.com/reset-password?token=...
            $link = "https://hoopcasting.com/reset-password?token=" . $token;

            // Email Subject & Body
            $subject = "Password Reset Request - Hoop Casting";
            $message = "Hi " . $user['name'] . ",\n\n";
            $message .= "You requested a password reset. Click the link below to reset your password:\n\n";
            $message .= $link . "\n\n";
            $message .= "This link is valid for 1 hour.\n\n";
            $message .= "If you did not request this, please ignore this email.";

            $headers = "From: no-reply@hoopcasting.com";

            // Attempt to send email
            // Note: This relies on PHP mail() being configured on the server
            $mailSent = @mail($email, $subject, $message, $headers);

            // Log for debugging (Simulate email)
            $logEntry = date('Y-m-d H:i:s') . " | Email: $email | Token: $token | Link: $link | MailSent: " . ($mailSent ? 'Yes' : 'No') . "\n";
            file_put_contents("../reset_links.log", $logEntry, FILE_APPEND);

            http_response_code(200);
            echo json_encode(["message" => "Reset link sent to your email.", "debug_link" => $link]); // Leaving debug_link for easy testing if mail fails
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to generate token."]);
        }
    } else {
        // Security: Don't reveal if user exists or not, but for UX usually we say "If email exists..."
        // Here we'll just say sent to avoid enumeration or say "Email not found" if preferred.
        // Let's standard: 
        http_response_code(200);
        echo json_encode(["message" => "If your email is registered, you will receive a reset link."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Email is required."]);
}
?>