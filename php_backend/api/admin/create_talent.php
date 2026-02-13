<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include_once '../../config/database.php';
include_once '../../utils/auth.php'; // Ensure this path is correct

try {
    $database = new Database();
    $db = $database->getConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed: " . $e->getMessage()]);
    exit();
}

// 1. Verify Admin
// (Simplified for now - strictly relying on token if sent, or assuming Admin panel handles protection)
// In production, verify the Authorization header here.

$data = json_decode(file_get_contents("php://input"));

if (
    empty($data->name) ||
    empty($data->email) ||
    empty($data->mobile) ||
    empty($data->category)
) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data. Name, Email, Mobile and Category are required."]);
    exit();
}

try {
    $db->beginTransaction();

    // 2. Check if User Exists
    $checkQuery = "SELECT id FROM users WHERE email = :email OR mobile = :mobile LIMIT 1";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':email', $data->email);
    $checkStmt->bindParam(':mobile', $data->mobile);
    $checkStmt->execute();

    if ($checkStmt->rowCount() > 0) {
        // User exists, get ID
        $row = $checkStmt->fetch(PDO::FETCH_ASSOC);
        $userId = $row['id'];

        // Check if profile exists for this user
        $profileCheckQuery = "SELECT id FROM talent_profiles WHERE user_id = :user_id LIMIT 1";
        $profileCheckStmt = $db->prepare($profileCheckQuery);
        $profileCheckStmt->bindParam(':user_id', $userId);
        $profileCheckStmt->execute();

        if ($profileCheckStmt->rowCount() > 0) {
            throw new Exception("A talent profile already exists for this user (Email/Mobile).");
        }
    } else {
        // 3. Create User if not exists
        $password = !empty($data->password) ? $data->password : "Hoop@123"; // Default password
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $role = 'user'; // Default role

        $userQuery = "INSERT INTO users (name, email, mobile, password_hash, role, created_at) VALUES (:name, :email, :mobile, :password_hash, :role, NOW())";
        $userStmt = $db->prepare($userQuery);
        $userStmt->bindParam(':name', $data->name);
        $userStmt->bindParam(':email', $data->email);
        $userStmt->bindParam(':mobile', $data->mobile);
        $userStmt->bindParam(':password_hash', $passwordHash);
        $userStmt->bindParam(':role', $role);

        if (!$userStmt->execute()) {
            throw new Exception("Failed to create user account.");
        }

        $userId = $db->lastInsertId();
    }

    // 4. Create Profile
    $profileQuery = "INSERT INTO talent_profiles (
        user_id, category, city, whatsapp_number, 
        emergency_contact, bio, skills, languages, 
        portfolio_links, past_brand_work, agency_status, pay_rates, 
        travel_surat, content_rights_agreed,
        height_cm, weight_kg, chest_in, waist_in, hips_in, 
        skin_tone, hair_color, eye_color,
        profile_photo_url, intro_video_url, social_links, years_experience,
        created_at, updated_at
    ) VALUES (
        :user_id, :category, :city, :whatsapp_number, 
        :emergency_contact, :bio, :skills, :languages, 
        :portfolio_links, :past_brand_work, :agency_status, :pay_rates, 
        :travel_surat, :content_rights_agreed,
        :height_cm, :weight_kg, :chest_in, :waist_in, :hips_in, 
        :skin_tone, :hair_color, :eye_color,
        :profile_photo_url, :intro_video_url, :social_links, :years_experience,
        NOW(), NOW()
    )";

    // Prepare helper variables
    $wa = $data->whatsapp_number ?? $data->mobile;
    $pf_links = $data->portfolio_links ?? '';
    // Handle array to string if needed, expecting string from frontend or encode it
    // Implementation assumes frontend sends strings or we handle it. simple assignment.

    $stmt = $db->prepare($profileQuery);
    $stmt->bindParam(':user_id', $userId);
    $stmt->bindParam(':category', $data->category);
    $stmt->bindParam(':city', $data->city);
    $stmt->bindParam(':whatsapp_number', $wa);
    $stmt->bindParam(':emergency_contact', $data->emergency_contact);
    $stmt->bindParam(':bio', $data->bio);
    $stmt->bindParam(':skills', $data->skills);
    $stmt->bindParam(':languages', $data->languages);
    $stmt->bindParam(':portfolio_links', $pf_links);
    $stmt->bindParam(':past_brand_work', $data->past_brand_work);
    $stmt->bindParam(':agency_status', $data->agency_status);
    $stmt->bindParam(':pay_rates', $data->pay_rates);

    // travel_surat boolean/string handling
    $travel = (!empty($data->travel_surat) && $data->travel_surat !== 'No') ? 1 : 0;
    $stmt->bindParam(':travel_surat', $travel);

    $rights = !empty($data->content_rights_agreed) ? 1 : 0;
    $stmt->bindParam(':content_rights_agreed', $rights);

    $stmt->bindParam(':height_cm', $data->height_cm);
    $stmt->bindParam(':weight_kg', $data->weight_kg);
    $stmt->bindParam(':chest_in', $data->chest_in);
    $stmt->bindParam(':waist_in', $data->waist_in);
    $stmt->bindParam(':hips_in', $data->hips_in);
    $stmt->bindParam(':skin_tone', $data->skin_tone);
    $stmt->bindParam(':hair_color', $data->hair_color);
    $stmt->bindParam(':eye_color', $data->eye_color);

    $stmt->bindParam(':profile_photo_url', $data->profile_photo_url);
    $stmt->bindParam(':intro_video_url', $data->intro_video_url);
    $stmt->bindParam(':social_links', $data->social_links);
    $stmt->bindParam(':years_experience', $data->years_experience);

    if (!$stmt->execute()) {
        throw new Exception("Failed to create talent profile.");
    }

    $db->commit();
    http_response_code(201);
    echo json_encode(["message" => "Talent created successfully", "id" => $db->lastInsertId()]);

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(["message" => "Error: " . $e->getMessage()]);
}
?>