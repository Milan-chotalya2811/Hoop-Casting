<?php
// Complete Database Reset Script for HoopCasting
// WARNING: This will DELETE ALL DATA. Use with caution.

ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: text/html; charset=UTF-8");

include_once dirname(__DIR__) . '/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "<h1>Database Reset Process Started...</h1>";

    // 1. Disable Foreign Keys Checks to allow dropping tables freely
    $db->exec("SET foreign_key_checks = 0");

    // 2. Drop Existing Tables
    $tables = ['users', 'user_profiles', 'blogs', 'contact_messages', 'password_resets'];
    foreach ($tables as $table) {
        $db->exec("DROP TABLE IF EXISTS $table");
        echo "Deleted table: $table <br>";
    }

    // 3. Re-Enable Foreign Keys
    $db->exec("SET foreign_key_checks = 1");
    echo "<hr>";

    // 4. Create Users Table (Authentication)
    $sql_users = "CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        mobile VARCHAR(15) NOT NULL UNIQUE,
        email VARCHAR(100) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        api_token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $db->exec($sql_users);
    echo "✅ Created 'users' table.<br>";

    // 5. Create User Profiles Table (Talent Details)
    $sql_profiles = "CREATE TABLE user_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        
        -- Personal Info
        dob DATE,
        gender ENUM('Male','Female','Other'),
        city VARCHAR(100),
        state VARCHAR(100),
        about TEXT,
        
        -- Physical Stats
        height_cm INT,
        weight_kg INT,
        complexion VARCHAR(50),
        eye_color VARCHAR(50),
        hair_color VARCHAR(50),
        body_type VARCHAR(50),
        
        -- Experience
        years_experience INT DEFAULT 0,
        skills TEXT, -- JSON array
        languages TEXT, -- JSON array
        past_work LONGTEXT,
        
        -- Media
        profile_photo_url VARCHAR(255),
        gallery_urls LONGTEXT, -- JSON array of image URLs
        video_urls LONGTEXT, -- JSON array
        portfolio_links LONGTEXT,
        
        -- Admin Controls
        category VARCHAR(100),
        is_verified BOOLEAN DEFAULT FALSE,
        is_featured BOOLEAN DEFAULT FALSE,
        is_hidden BOOLEAN DEFAULT FALSE,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    $db->exec($sql_profiles);
    echo "✅ Created 'user_profiles' table.<br>";

    // 6. Create Blogs Table
    $sql_blogs = "CREATE TABLE blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        content LONGTEXT NOT NULL,
        image_url VARCHAR(255),
        meta_title VARCHAR(255),
        meta_description TEXT,
        keywords TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $db->exec($sql_blogs);
    echo "✅ Created 'blogs' table.<br>";

    // 7. Create Contact Messages Table
    $sql_contact = "CREATE TABLE contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100),
        mobile VARCHAR(15),
        category VARCHAR(100),
        subject VARCHAR(255),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $db->exec($sql_contact);
    echo "✅ Created 'contact_messages' table.<br>";

    // 8. Create Default Admin User
    // Mobile: 9876543210, Password: admin123(hashed)
    $admin_pass = password_hash('admin123', PASSWORD_BCRYPT);
    $admin_token = bin2hex(random_bytes(32));

    $stmt = $db->prepare("INSERT INTO users (name, mobile, email, password_hash, role, api_token) VALUES ('Super Admin', '9876543210', 'admin@hoopcasting.com', :pass, 'admin', :token)");
    $stmt->execute([':pass' => $admin_pass, ':token' => $admin_token]);
    echo "<hr><h3>🎉 Success! Database Reset Complete.</h3>";
    echo "Default Admin Created:<br>Mobile: 9876543210<br>Password: admin123<br>";

} catch (PDOException $e) {
    echo "<h1>❌ Error: " . $e->getMessage() . "</h1>";
}
?>