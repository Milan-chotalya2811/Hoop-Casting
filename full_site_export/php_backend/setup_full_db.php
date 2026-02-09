<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once './config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "<h1>Full Database Fix & Setup</h1>";

// 1. Create Talent Profiles Table
echo "<h2>1. Creating 'talent_profiles' Table...</h2>";
$sqlTalent = "CREATE TABLE IF NOT EXISTS talent_profiles (
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
) ENGINE=InnoDB";

try {
    $db->exec($sqlTalent);
    echo "<p style='color:green'>Table `talent_profiles` created successfully.</p>";
} catch (PDOException $e) {
    echo "<p style='color:red'>Error creating talent_profiles: " . $e->getMessage() . "</p>";
}

// 2. Create Contact Messages Table
echo "<h2>2. Creating 'contact_messages' Table...</h2>";
$sqlContact = "CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    mobile VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB";

try {
    $db->exec($sqlContact);
    echo "<p style='color:green'>Table `contact_messages` created successfully.</p>";
} catch (PDOException $e) {
    echo "<p style='color:red'>Error creating contact_messages: " . $e->getMessage() . "</p>";
}

// 2b. ALTER Contact Messages Table (Safety Check)
try {
    $db->exec("ALTER TABLE contact_messages ADD COLUMN mobile VARCHAR(20) AFTER email");
    echo "<p style='color:blue'>Added 'mobile' column to existing contact_messages table.</p>";
} catch (Exception $e) {
    // Column likely exists
    echo "<p style='color:grey'>Mobile column check: likely already exists.</p>";
}

// 3. Create Dummy Data
echo "<h2>3. Creating Dummy Data...</h2>";

// Get first user to link profile to
$stmt = $db->query("SELECT id FROM users LIMIT 1");
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    // Check if profile exists
    $check = $db->prepare("SELECT id FROM talent_profiles WHERE user_id = ?");
    $check->execute([$user['id']]);

    if ($check->rowCount() == 0) {
        $insert = "INSERT INTO talent_profiles (user_id, category, city, bio, is_hidden, created_at) 
                   VALUES (?, 'Actor', 'Mumbai', 'Auto-generated Admin Profile', 0, NOW())";
        try {
            $db->prepare($insert)->execute([$user['id']]);
            echo "<p style='color:green'>Dummy Talent Profile created for User ID " . $user['id'] . "</p>";
        } catch (Exception $e) {
            echo "<p style='color:red'>Failed to create dummy profile: " . $e->getMessage() . "</p>";
        }
    } else {
        echo "<p style='color:orange'>Talent Profile already exists.</p>";
    }
} else {
    echo "<p style='color:red'>No Users found! Cannot create dummy profile.</p>";
}

echo "<h3>✅ Setup Complete! Go back to Admin Panel.</h3>";
?>