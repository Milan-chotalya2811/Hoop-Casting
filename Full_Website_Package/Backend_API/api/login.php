<?php
// Debugging enabled
ini_set('display_errors', 0); // Don't leak errors to output (breaks JSON)
error_reporting(E_ALL);

include_once dirname(__DIR__) . '/config/database.php';

// Logging Request for Debugging
$logFile = 'debug_log.txt';
$rawInput = file_get_contents("php://input");
$logMessage = "[" . date('Y-m-d H:i:s') . "] Login Attempt: " . $rawInput . "\n";
file_put_contents($logFile, $logMessage, FILE_APPEND);

$database = new Database();
$db = $database->getConnection();

$data = json_decode($rawInput);

if (!empty($data->mobile) && !empty($data->password)) {
    // Sanitize identity: Remove all white spaces (even invisible ones like non-breaking spaces)
    $identifier = preg_replace('/\s+/', '', strtolower(trim($data->mobile)));
    $password = trim($data->password);

    // Fetch matching users
    $query = "SELECT id, name, mobile, email, password_hash, role, api_token FROM users WHERE LOWER(mobile) = :identifier OR LOWER(email) = :identifier";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':identifier', $identifier);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $loggedInUser = null;
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Check both trimmed and original password for legacy/autofill support
            if (password_verify($password, $row['password_hash']) || password_verify($data->password, $row['password_hash'])) {
                $loggedInUser = $row;
                break;
            }
        }

        if ($loggedInUser) {
            $token = $loggedInUser['api_token'];
            if (empty($token)) {
                $token = bin2hex(random_bytes(32));
                $update = $db->prepare("UPDATE users SET api_token = :token WHERE id = :id");
                $update->execute([':token' => $token, ':id' => $loggedInUser['id']]);
            }

            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Login successful.",
                "token" => $token,
                "user" => [
                    "id" => (int)$loggedInUser['id'],
                    "name" => $loggedInUser['name'],
                    "mobile" => $loggedInUser['mobile'],
                    "email" => $loggedInUser['email'],
                    "role" => $loggedInUser['role']
                ]
            ]);
            file_put_contents($logFile, " - SUCCESS: User " . $loggedInUser['id'] . " logged in\n", FILE_APPEND);
        } else {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Invalid password."]);
            file_put_contents($logFile, " - FAILED: Invalid Password\n", FILE_APPEND);
        }
    } else {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "User not found with this email or mobile number."]);
        file_put_contents($logFile, " - FAILED: User Not Found ($identifier)\n", FILE_APPEND);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Incomplete data."]);
    file_put_contents($logFile, " - FAILED: Incomplete Data\n", FILE_APPEND);
}
?>