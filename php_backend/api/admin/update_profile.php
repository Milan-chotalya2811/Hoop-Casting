<?php
include_once dirname(__DIR__) . '/../config/database.php';
include_once dirname(__DIR__) . '/../utils/auth.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$database = new Database();
$db = $database->getConnection();

// Authenticate Admin
$user = authenticate($db);
if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') {
    http_response_code(403);
    echo json_encode(["message" => "Access denied. Admins only."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(["message" => "Profile ID is required."]);
    exit();
}

$profile_id = $data['id'];

// Check if profile exists
$check_query = "SELECT id FROM talent_profiles WHERE id = :id";
$check_stmt = $db->prepare($check_query);
$check_stmt->bindParam(':id', $profile_id);
$check_stmt->execute();

if ($check_stmt->rowCount() == 0) {
    http_response_code(404);
    echo json_encode(["message" => "Profile not found."]);
    exit();
}

// Fields to update (same as profile.php)
$fields = [
    'gender',
    'dob',
    'city',
    'state',
    'country',
    'height_cm',
    'weight_kg',
    'chest_in',
    'waist_in',
    'hips_in',
    'skin_tone',
    'hair_color',
    'eye_color',
    'category',
    'years_experience',
    'languages',
    'skills',
    'past_work',
    'portfolio_links',
    'interested_in',
    'willing_to_travel',
    'profile_photo_url',
    'gallery_urls',
    'intro_video_url',
    'social_links',
    'whatsapp_number',
    'emergency_contact',
    'bio',
    'past_brand_work',
    'agency_status',
    'pay_rates',
    'travel_surat',
    'content_rights_agreed',
    'custom_fields'
];

$update_parts = [];
$params = [':id' => $profile_id];

foreach ($fields as $field) {
    if ($field === 'whatsapp_number' && isset($data[$field]) && !empty($data[$field])) {
        if (!preg_match('/^[0-9]{10}$/', $data[$field])) {
            http_response_code(400);
            echo json_encode(["message" => "WhatsApp number must be exactly 10 digits."]);
            exit();
        }
    }

    if (isset($data[$field])) {
        $val = $data[$field];
        if (is_array($val) || is_object($val)) {
            $val = json_encode($val);
        }

        $update_parts[] = "$field = :$field";
        $params[":$field"] = $val;
    }
}

// Also allow updating internal notes/status if needed (but currently frontend doesn't send them here)
// Only proceed if there are updates
if (empty($update_parts)) {
    http_response_code(400);
    echo json_encode(["message" => "No data provided to update."]);
    exit();
}

// Perform Update
$sql = "UPDATE talent_profiles SET " . implode(', ', $update_parts) . " WHERE id = :id";
$stmt = $db->prepare($sql);

if ($stmt->execute($params)) {
    http_response_code(200);
    echo json_encode(["message" => "Profile updated successfully by admin."]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Failed to update profile.", "error" => $stmt->errorInfo()]);
}
?>