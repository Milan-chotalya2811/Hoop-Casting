
-- Create Database
CREATE DATABASE IF NOT EXISTS monkey_casting;
USE monkey_casting;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    api_token VARCHAR(64) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Talent Profiles Table
CREATE TABLE IF NOT EXISTS talent_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    
    -- Personal Details
    gender VARCHAR(50),
    dob DATE,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    whatsapp_number VARCHAR(20),
    emergency_contact VARCHAR(20),
    age INT,
    bio TEXT,
    
    -- Physical Details
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    chest_in DECIMAL(5,2),
    waist_in DECIMAL(5,2),
    hips_in DECIMAL(5,2),
    skin_tone VARCHAR(50),
    hair_color VARCHAR(50),
    eye_color VARCHAR(50),
    
    -- Professional Details
    category VARCHAR(50) NOT NULL,
    years_experience DECIMAL(4,1) DEFAULT 0,
    languages TEXT, -- Checkbox comma separated
    skills TEXT, -- Checkbox comma separated
    past_work TEXT,
    past_brand_work TEXT,
    agency_status VARCHAR(100),
    pay_rates VARCHAR(255),
    portfolio_links TEXT, -- JSON or comma separated URLs
    
    -- Availability
    interested_in TEXT,
    willing_to_travel TINYINT(1) DEFAULT 0,
    travel_surat TINYINT(1) DEFAULT 0,
    content_rights_agreed TINYINT(1) DEFAULT 0,
    
    -- Media (Paths stored in local uploads folder)
    profile_photo_url VARCHAR(255),
    gallery_urls TEXT, -- JSON array of file paths
    intro_video_url VARCHAR(255),
    social_links VARCHAR(255),
    
    -- Custom Fields
    custom_fields TEXT, -- JSON string
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
