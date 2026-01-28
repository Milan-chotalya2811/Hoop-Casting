<?php
function authenticate($db)
{
    // Fallback for apache_request_headers() if it doesn't exist
    if (!function_exists('apache_request_headers')) {
        function apache_request_headers()
        {
            $headers = array();
            foreach ($_SERVER as $key => $value) {
                if (substr($key, 0, 5) == 'HTTP_') {
                    $header = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))));
                    $headers[$header] = $value;
                }
            }
            return $headers;
        }
    }

    $headers = apache_request_headers();
    $token = "";

    // Check both Authorization and authorization (case sensitivity)
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($headers['authorization']) ? $headers['authorization'] : null);

    if ($authHeader) {
        $matches = array();
        preg_match('/Bearer\s(\S+)/', $authHeader, $matches);
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