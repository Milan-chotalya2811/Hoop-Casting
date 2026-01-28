<?php
// Database credentials
// RENAME THIS FILE TO database.php AND UPDATE VALUES

class Database
{
    private $host = "localhost";
    private $db_name = "u172519708_hoop_casting26";
    private $username = "u172519708_Milanchotaliya";
    private $password = "Mayur@Monkey2023";
    public $conn;

    public function getConnection()
    {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $exception) {
            echo json_encode(["error" => "Connection error: " . $exception->getMessage()]);
            exit();
        }
        return $this->conn;
    }
}
?>