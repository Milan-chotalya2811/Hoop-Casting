<?php
function authenticate($db)
{
    // Try to get the Authorization header from various possible sources
    $authHeader = null;

    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
        } elseif (isset($headers['authorization'])) {
            $authHeader = $headers['authorization'];
        }
    }

    $token = "";
    if ($authHeader) {
        $matches = array();
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
        }
    }

    if (empty($token)) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized. No token provided."]);
        exit();
    }

    $query = "SELECT id, name, role FROM users WHERE api_token = :token LIMIT 1";
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