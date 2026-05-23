<?php
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $result = $conn->query('SELECT id_mitra, nama_mitra, jenis_mitra, kontak, email, alamat, status FROM mitra ORDER BY id_mitra ASC');
  respond(['success' => true, 'data' => $result->fetch_all(MYSQLI_ASSOC)]);
}

if ($method === 'POST') {
  $input = json_input();
  require_fields($input, ['nama_mitra', 'jenis_mitra', 'kontak', 'email', 'status']);

  $id = isset($input['id_mitra']) && $input['id_mitra'] !== '' ? (int) $input['id_mitra'] : 0;
  $alamat = $input['alamat'] ?? '';

  if ($id > 0) {
    $stmt = $conn->prepare('UPDATE mitra SET nama_mitra = ?, jenis_mitra = ?, kontak = ?, email = ?, alamat = ?, status = ? WHERE id_mitra = ?');
    $stmt->bind_param('ssssssi', $input['nama_mitra'], $input['jenis_mitra'], $input['kontak'], $input['email'], $alamat, $input['status'], $id);
    $stmt->execute();
    respond(['success' => true, 'message' => 'Data mitra berhasil diperbarui.']);
  }

  $stmt = $conn->prepare('INSERT INTO mitra (nama_mitra, jenis_mitra, kontak, email, alamat, status) VALUES (?, ?, ?, ?, ?, ?)');
  $stmt->bind_param('ssssss', $input['nama_mitra'], $input['jenis_mitra'], $input['kontak'], $input['email'], $alamat, $input['status']);
  $stmt->execute();
  respond(['success' => true, 'message' => 'Data mitra berhasil ditambahkan.', 'id_mitra' => $conn->insert_id], 201);
}

if ($method === 'DELETE') {
  $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
  if ($id <= 0) respond(['success' => false, 'message' => 'ID mitra tidak valid.'], 422);

  $stmt = $conn->prepare('DELETE FROM mitra WHERE id_mitra = ?');
  $stmt->bind_param('i', $id);
  $stmt->execute();
  respond(['success' => true, 'message' => 'Data mitra berhasil dihapus.']);
}

respond(['success' => false, 'message' => 'Method tidak diizinkan.'], 405);
?>
