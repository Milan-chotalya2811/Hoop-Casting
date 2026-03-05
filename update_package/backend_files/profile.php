<?php
include_once dirname(__DIR__) . '/config/database.php';
include_once dirname(__DIR__) . '/utils/auth.php';

$database = new Database();
$db = $database->getConnection();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    $profile_id = isset($_GET['id']) ? $_GET['id'] : null;

    if ($profile_id) {
        // Fetch specific profile by ID (Public)
        $query = "SELECT t.*, u.name, u.mobile, u.email FROM talent_profiles t JOIN users u ON t.user_id = u.id WHERE t.id = :id AND t.deleted_at IS NULL LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $profile_id);
    } else {
        // Fetch My Profile (Authenticated)
        $user = authenticate($db);
        $user_id = $user['id'];
        $query = "SELECT t.*, u.name, u.mobile, u.email FROM talent_profiles t JOIN users u ON t.user_id = u.id WHERE t.user_id = :user_id AND t.deleted_at IS NULL LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
    }

    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($row);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Profile not found."]);
    }
} elseif ($method == 'POST') {
    // Save/Update Profile
    $user = authenticate($db);
    $data = json_decode(file_get_contents("php://input"), true);

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

    $params = [];
    $update_parts = [];
    $insert_cols = ['user_id'];
    $insert_vals = [':user_id'];
    $params[':user_id'] = $user['id'];

    foreach ($fields as $field) {
        // Validate WhatsApp Number
        if ($field === 'whatsapp_number' && isset($data[$field]) && !empty($data[$field])) {
            if (!preg_match('/^[0-9]{10}$/', $data[$field])) {
                http_response_code(400);
                echo json_encode(["message" => "WhatsApp number must be exactly 10 digits."]);
                exit();
            }
        }

        if (isset($data[$field])) {
            $val = $data[$field];
            if (is_array($val)) {
                $val = json_encode($val);
            }
            if ($field === 'custom_fields' && is_array($val) || is_object($val)) {
                $val = json_encode($val);
            }

            $insert_cols[] = $field;
            $insert_vals[] = ":$field";
            $update_parts[] = "$field = :$field";
            $params[":$field"] = $val;
        }
    }

    // Use INSERT ... ON DUPLICATE KEY UPDATE
    if (empty($update_parts)) {
        http_response_code(400);
        echo json_encode(["message" => "No data provided to update."]);
        exit();
    }

    // Check if profile exists BEFORE upsert to determing if this is a NEW creation
    $checkQuery = "SELECT id FROM talent_profiles WHERE user_id = :user_id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':user_id', $user['id']);
    $checkStmt->execute();
    $isNewProfile = ($checkStmt->rowCount() === 0);

    $sql = "INSERT INTO talent_profiles (" . implode(', ', $insert_cols) . ") 
            VALUES (" . implode(', ', $insert_vals) . ") 
            ON DUPLICATE KEY UPDATE deleted_at = NULL, " . implode(', ', $update_parts);

    $stmt = $db->prepare($sql);

    // Debugging
    // error_log(print_r($params, true));

    if ($stmt->execute($params)) {

        // EMAIL LOGIC
        // TEMPORARY: Send email on EVERY update to test.
        // EMAIL LOGIC - Send on EVERY Create OR Update
        $userEmail = $user['email'];
        $adminEmail = 'juhi@monkeyads.in'; // Target Admin Email
        $senderEmail = 'noreply@hoopcasting.com';

        if ($isNewProfile) {
            // --- NEW PROFILE CREATED ---
            $subjectUser = "Welcome to Hoop Casting - Profile Created";
            $messageUser = "Thank you for registering with Hoop Casting.\nYour profile has been created successfully.";

            $subjectAdmin = "New Talent Profile Created";
            $messageAdmin = "New Talent Profile Created\n\n" .
                "A new talent profile has been successfully created.\n" .
                "User: " . ($user['name'] ?? 'Unknown');

        } else {
            // --- PROFILE UPDATED ---
            $subjectUser = "Hoop Casting - Profile Updated";
            $messageUser = "Your profile has been updated successfully.";

            $subjectAdmin = "Talent Profile Updated";
            $messageAdmin = "Talent Profile Updated\n\n" .
                "A talent profile has been updated.\n" .
                "User: " . ($user['name'] ?? 'Unknown');
        }

        // 1. Email to User
        $headersUser = "From: $senderEmail" . "\r\n" .
            "Reply-To: $adminEmail" . "\r\n" .
            "X-Mailer: PHP/" . phpversion();

        $mail1 = mail($userEmail, $subjectUser, $messageUser, $headersUser);
        if (!$mail1) {
            error_log("Failed to send email to User: $userEmail");
        }

        // 2. Email to Admin
        $headersAdmin = "From: $senderEmail" . "\r\n" .
            "Reply-To: $userEmail" . "\r\n" .
            "X-Mailer: PHP/" . phpversion();

        $mail2 = mail($adminEmail, $subjectAdmin, $messageAdmin, $headersAdmin);
        if (!$mail2) {
            error_log("Failed to send email to Admin: $adminEmail");
        }

        http_response_code(200);
        echo json_encode(["message" => "Profile saved successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Failed to save profile.", "error" => $stmt->errorInfo()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed."]);
}
?>