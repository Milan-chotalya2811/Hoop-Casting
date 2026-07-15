<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once './config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "<h1>Setup & Fix Admin Data</h1>";

// 1. Ensure Table Exists
echo "<h2>1. Checking Database Structure...</h2>";
$sql = "CREATE TABLE IF NOT EXISTS talent_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    category VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    gender VARCHAR(20),
    dob DATE,
    age INT,
    whatsapp_number VARCHAR(15),
    emergency_contact VARCHAR(100),
    bio TEXT,
    skills TEXT,
    languages TEXT,
    portfolio_links TEXT,
    past_brand_work TEXT,
    agency_status VARCHAR(50),
    pay_rates VARCHAR(255),
    travel_surat TINYINT(1) DEFAULT 0,
    content_rights_agreed TINYINT(1) DEFAULT 0,
    profile_photo_url VARCHAR(255),
    gallery_urls TEXT,
    social_links TEXT,
    intro_video_url VARCHAR(255),
    height_cm FLOAT,
    weight_kg FLOAT,
    chest_in FLOAT,
    waist_in FLOAT,
    hips_in FLOAT,
    skin_tone VARCHAR(50),
    hair_color VARCHAR(50),
    eye_color VARCHAR(50),
    years_experience FLOAT,
    custom_fields JSON,
    is_hidden TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";

try {
    $db->exec($sql);
    echo "<p style='color:green'>Table `talent_profiles` checked/created.</p>";
} catch (PDOException $e) {
    echo "<p style='color:red'>Error creating table: " . $e->getMessage() . "</p>";
}

// 2. Insert Dummy Talent associated with the FIRST valid user
echo "<h2>2. Checking for Talents...</h2>";

// Get first user
$stmt = $db->query("SELECT id, name, email FROM users LIMIT 1");
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo "<p style='color:orange'>No users found! Please Register a user first.</p>";
    echo "<a href='/register' target='_blank'>Go to Register</a>";
} else {
    echo "<p>Found User: " . htmlspecialchars($user['name']) . " (ID: " . $user['id'] . ")</p>";

    // Check if profile exists for this user
    $stmt = $db->prepare("SELECT id FROM talent_profiles WHERE user_id = ?");
    $stmt->execute([$user['id']]);
    $profile = $stmt->fetch();

    if ($profile) {
        echo "<p style='color:green'>Profile already exists for this user (ID: " . $profile['id'] . ").</p>";
    } else {
        echo "<p>Creating Dummy Profile for this user...</p>";
        $insert = "INSERT INTO talent_profiles (user_id, category, city, bio, skills, is_hidden, created_at, content_rights_agreed) 
                   VALUES (?, 'Actor', 'Mumbai', 'This is a demo profile created by Admin Fix script.', '[\"Acting\", \"Dancing\"]', 0, NOW(), 1)";
        $stmt = $db->prepare($insert);
        if ($stmt->execute([$user['id']])) {
            echo "<p style='color:green'>Dummy Profile Created Successfully!</p>";
        } else {
            echo "<p style='color:red'>Failed to create profile: " . print_r($stmt->errorInfo(), true) . "</p>";
        }
    }
}

// 3. Show Current Stats
echo "<h2>3. Current Admin Stats</h2>";
$stats = [];
$stats['total_users'] = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
$stats['total_talents'] = $db->query("SELECT COUNT(*) FROM talent_profiles")->fetchColumn();
$stats['visible_talents'] = $db->query("SELECT COUNT(*) FROM talent_profiles WHERE deleted_at IS NULL AND is_hidden = 0")->fetchColumn();
echo "<pre>" . print_r($stats, true) . "</pre>";
echo "<p>Go back to <a href='/admin'>Admin Panel</a> and refresh.</p>";
?>