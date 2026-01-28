<?php
function authenticate($db)
{
    $headers = apache_request_headers();
    $token = "";

    if (isset($headers['Authorization'])) {
        $matches = array();
        preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches);
        if (isset($matches[1])) {
            $token = $matches[1];
        }
    }

    if (empty($token)) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized. No token provided."]);
        exit();
    }

    $query = "SELECT id, role FROM users WHERE api_token = :token LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':token', $token);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } else {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized. Invalid token."]);
        exit();
    }
}
?>