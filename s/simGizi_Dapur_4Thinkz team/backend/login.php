<?php
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/koneksi.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  respond(['success' => false, 'message' => 'Method tidak diizinkan.'], 405);
}

$input = json_input();
require_fields($input, ['username', 'password']);

$stmt = $conn->prepare('SELECT id_user, username, password, nama, role FROM users WHERE username = ? LIMIT 1');
$stmt->bind_param('s', $input['username']);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user || !password_verify($input['password'], $user['password'])) {
  respond(['success' => false, 'message' => 'Username atau password salah.'], 401);
}

respond([
  'success' => true,
  'message' => 'Login berhasil.',
  'user' => [
    'id_user' => (int) $user['id_user'],
    'username' => $user['username'],
    'nama' => $user['nama'],
    'role' => $user['role']
  ]
]);
?>
