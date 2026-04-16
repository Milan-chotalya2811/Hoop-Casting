<?php
// Script to compress existing images in the uploads folder
// Run this once manually from your browser: yourdomain.com/php_backend/api/compress_existing.php

$target_dir = "../uploads/";

if (!file_exists($target_dir)) {
    die("Uploads directory not found.");
}

$files = glob($target_dir . "*.{jpg,jpeg,png}", GLOB_BRACE);
$count = 0;
$total = count($files);

echo "<h1>Compressing $total images...</h1>";
echo "<ul>";

foreach ($files as $file) {
    $file_ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $temp_file = $file;
    list($width, $height) = getimagesize($temp_file);
    
    // Max dimension 1200px
    $max_dim = 1200;
    if ($width > $max_dim || $height > $max_dim) {
        $ratio = $width / $height;
        if ($ratio > 1) {
            $new_width = $max_dim;
            $new_height = $max_dim / $ratio;
        } else {
            $new_height = $max_dim;
            $new_width = $max_dim * $ratio;
        }
        
        $src = ($file_ext == 'png') ? @imagecreatefrompng($temp_file) : @imagecreatefromjpeg($temp_file);
        if (!$src) continue;
        
        $dst = imagecreatetruecolor($new_width, $new_height);
        
        if ($file_ext == 'png') {
            imagealphablending($dst, false);
            imagesavealpha($dst, true);
            imagecopyresampled($dst, $src, 0, 0, 0, 0, $new_width, $new_height, $width, $height);
            imagepng($dst, $file, 8);
        } else {
            imagecopyresampled($dst, $src, 0, 0, 0, 0, $new_width, $new_height, $width, $height);
            imagejpeg($dst, $file, 75);
        }
        
        imagedestroy($src);
        imagedestroy($dst);
        echo "<li>Compressed: " . basename($file) . "</li>";
        $count++;
    }
}

echo "</ul>";
echo "<h2>Done! Compressed $count large images.</h2>";
?>
