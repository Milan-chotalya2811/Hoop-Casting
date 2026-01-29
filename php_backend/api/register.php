<?php
include_once dirname(__DIR__) . '/config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->name) &&
    !empty($data->mobile) &&
    !empty($data->password)
) {
    // Validate Mobile Number
    if (!preg_match('/^[0-9]{10}$/', $data->mobile)) {
        http_response_code(400);
        echo json_encode(["message" => "Mobile number must be exactly 10 digits."]);
        exit();
    }
    // Check if mobile or email exists
    $checkQuery = "SELECT id FROM users WHERE mobile = :mobile OR email = :email LIMIT 1";
    $stmt = $db->prepare($checkQuery);
    $stmt->bindParam(':mobile', $data->mobile);
    $email = !empty($data->email) ? $data->email : null;
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(["message" => "User already exists with this mobile or email."]);
        exit();
    }

    // Create new user
    $query = "INSERT INTO users (name, mobile, email, password_hash, api_token) VALUES (:name, :mobile, :email, :password_hash, :api_token)";
    $stmt = $db->prepare($query);

    $data->name = htmlspecialchars(strip_tags($data->name));
    $data->mobile = htmlspecialchars(strip_tags($data->mobile));
    $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
    $api_token = bin2hex(random_bytes(32));

    $stmt->bindParam(":name", $data->name);
    $stmt->bindParam(":mobile", $data->mobile);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":password_hash", $password_hash);
    $stmt->bindParam(":api_token", $api_token);

    try {
        if ($stmt->execute()) {
            $user_id = $db->lastInsertId();
            http_response_code(201);
            echo json_encode([
                "message" => "User registered successfully.",
                "token" => $api_token,
                "user" => [
                    "id" => $user_id,
                    "name" => $data->name,
                    "mobile" => $data->mobile,
                    "email" => $email,
                    "role" => "user"
                ]
            ]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to register user.", "error" => $stmt->errorInfo()]);
        }
    } catch (PDOException $e) {
        http_response_code(503);
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data. Name, mobile and password are required."]);
}
?>