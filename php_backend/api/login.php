<?php
include_once dirname(__DIR__) . '/config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->mobile) && !empty($data->password)) {
    $query = "SELECT id, name, mobile, email, password_hash, role, api_token FROM users WHERE mobile = :identifier OR email = :identifier LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':identifier', $data->mobile); // data->mobile contains the input identifier
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (password_verify($data->password, $row['password_hash'])) {
            // If token is empty (legacy or new session), generate one
            if (empty($row['api_token'])) {
                $new_token = bin2hex(random_bytes(32));
                $update = $db->prepare("UPDATE users SET api_token = :token WHERE id = :id");
                $update->execute([':token' => $new_token, ':id' => $row['id']]);
                $row['api_token'] = $new_token;
            }

            http_response_code(200);
            echo json_encode([
                "message" => "Login successful.",
                "token" => $row['api_token'],
                "user" => [
                    "id" => $row['id'],
                    "name" => $row['name'],
                    "mobile" => $row['mobile'],
                    "email" => $row['email'],
                    "role" => $row['role']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Invalid password."]);
        }
    } else {
        http_response_code(401);
        echo json_encode(["message" => "User not found."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data. Mobile and password are required."]);
}
?>