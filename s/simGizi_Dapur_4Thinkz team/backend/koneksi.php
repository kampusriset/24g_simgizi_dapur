<?php
$host = 'localhost';
$user = 'simgizi_user';
$pass = 'simgizi123';
$db   = 'simgizi';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
  http_response_code(500);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode([
    'success' => false,
    'message' => 'Koneksi database gagal: ' . $conn->connect_error
  ]);
  exit;
}

$conn->set_charset('utf8mb4');
?>
