<?php
include_once dirname(__DIR__) . '/config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->mobile) && !empty($data->password)) {
    // Trim the input identifier
    $identifier = trim($data->mobile);
    $input_password = trim($data->password); // Trim password to avoid autofill space issues

    // Fetch all users that match the given identifier (to handle duplicate accounts)
    $query = "SELECT id, name, mobile, email, password_hash, role, api_token FROM users WHERE mobile = :identifier OR email = :identifier";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':identifier', $identifier);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $loggedInUser = null;
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Verify password for each matching account
            if (password_verify($input_password, $row['password_hash']) || password_verify($data->password, $row['password_hash'])) {
                $loggedInUser = $row;
                break; // Found the matching valid account
            }
        }

        if ($loggedInUser) {
            // Unify token generation logic
            $tokenToUse = $loggedInUser['api_token'];
            
            // Re-generate token to ensure uniqueness and refresh session token
            if (empty($tokenToUse)) {
                $tokenToUse = bin2hex(random_bytes(32));
                $update = $db->prepare("UPDATE users SET api_token = :token WHERE id = :id");
                $update->execute([':token' => $tokenToUse, ':id' => $loggedInUser['id']]);
            }

            http_response_code(200);
            echo json_encode([
                "message" => "Login successful.",
                "token" => $tokenToUse,
                "user" => [
                    "id" => $loggedInUser['id'],
                    "name" => $loggedInUser['name'],
                    "mobile" => $loggedInUser['mobile'],
                    "email" => $loggedInUser['email'],
                    "role" => $loggedInUser['role']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Invalid password."]);
        }
    } else {
        http_response_code(401);
        echo json_encode(["message" => "User not found with this email or mobile number."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data. Mobile/Email and password are required."]);
}
?>