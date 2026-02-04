SET FOREIGN_KEY_CHECKS = 0;

-- 1. DROP EXISTING TABLES
DROP TABLE IF EXISTS `user_profiles`;
DROP TABLE IF EXISTS `blogs`;
DROP TABLE IF EXISTS `contact_messages`;
DROP TABLE IF EXISTS `password_resets`;
DROP TABLE IF EXISTS `users`;

-- 2. CREATE USERS TABLE
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `api_token` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `mobile` (`mobile`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CREATE PROFILE TABLE (Complete Profile Data)
CREATE TABLE `user_profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  
  -- Personal Info
  `dob` date DEFAULT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `about` text DEFAULT NULL,
  
  -- Stats
  `height_cm` int(11) DEFAULT NULL,
  `weight_kg` int(11) DEFAULT NULL,
  `chest_in` varchar(50) DEFAULT NULL,
  `waist_in` varchar(50) DEFAULT NULL,
  `hips_in` varchar(50) DEFAULT NULL,
  `complexion` varchar(50) DEFAULT NULL,
  `skin_tone` varchar(50) DEFAULT NULL,
  `eye_color` varchar(50) DEFAULT NULL,
  `hair_color` varchar(50) DEFAULT NULL,
  `body_type` varchar(50) DEFAULT NULL,
  
  -- Work
  `years_experience` varchar(50) DEFAULT '0',
  `skills` text DEFAULT NULL, -- JSON
  `languages` text DEFAULT NULL, -- JSON
  `past_work` longtext DEFAULT NULL,
  
  -- Media
  `profile_photo_url` varchar(255) DEFAULT NULL,
  `gallery_urls` longtext DEFAULT NULL, -- JSON
  `video_urls` longtext DEFAULT NULL, -- JSON
  `portfolio_links` longtext DEFAULT NULL, -- JSON
  `social_links` longtext DEFAULT NULL, -- JSON
  
  -- Extra
  `custom_fields` longtext DEFAULT NULL, -- JSON
  `category` varchar(100) DEFAULT NULL,
  `internal_name` varchar(255) DEFAULT NULL,
  
  -- Status
  `is_verified` tinyint(1) DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_hidden` tinyint(1) DEFAULT 0,
  
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CREATE BLOGS TABLE
CREATE TABLE `blogs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `keywords` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. CREATE CONTACT MESSAGES TABLE
CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- INSTRUCTIONS:
-- 1. Is query ko run kare.
-- 2. Website par jakar Register kare.
-- 3. Database me `users` table khole, aur apne user ka `role` 'user' se change karke 'admin' kar de manually.
