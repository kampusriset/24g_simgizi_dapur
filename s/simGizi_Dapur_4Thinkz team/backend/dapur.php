<?php
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $sql = 'SELECT d.id_dapur, d.nama_dapur, d.alamat, d.penanggung_jawab, d.kontak, d.status, d.id_mitra,
                 m.nama_mitra, m.jenis_mitra
          FROM dapur d
          LEFT JOIN mitra m ON m.id_mitra = d.id_mitra
          ORDER BY d.id_dapur ASC';
  $result = $conn->query($sql);
  respond(['success' => true, 'data' => $result->fetch_all(MYSQLI_ASSOC)]);
}

if ($method === 'POST') {
  $input = json_input();
  require_fields($input, ['nama_dapur', 'penanggung_jawab', 'kontak', 'status']);

  $id = isset($input['id_dapur']) && $input['id_dapur'] !== '' ? (int) $input['id_dapur'] : 0;
  $idMitra = isset($input['id_mitra']) && $input['id_mitra'] !== '' ? (int) $input['id_mitra'] : null;
  $alamat = $input['alamat'] ?? '';

  if ($id > 0) {
    $stmt = $conn->prepare('UPDATE dapur SET nama_dapur = ?, alamat = ?, penanggung_jawab = ?, kontak = ?, status = ?, id_mitra = ? WHERE id_dapur = ?');
    $stmt->bind_param('sssssii', $input['nama_dapur'], $alamat, $input['penanggung_jawab'], $input['kontak'], $input['status'], $idMitra, $id);
    $stmt->execute();
    respond(['success' => true, 'message' => 'Data dapur berhasil diperbarui.']);
  }

  $stmt = $conn->prepare('INSERT INTO dapur (nama_dapur, alamat, penanggung_jawab, kontak, status, id_mitra) VALUES (?, ?, ?, ?, ?, ?)');
  $stmt->bind_param('sssssi', $input['nama_dapur'], $alamat, $input['penanggung_jawab'], $input['kontak'], $input['status'], $idMitra);
  $stmt->execute();
  respond(['success' => true, 'message' => 'Data dapur berhasil ditambahkan.', 'id_dapur' => $conn->insert_id], 201);
}

if ($method === 'DELETE') {
  $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
  if ($id <= 0) respond(['success' => false, 'message' => 'ID dapur tidak valid.'], 422);

  $stmt = $conn->prepare('DELETE FROM dapur WHERE id_dapur = ?');
  $stmt->bind_param('i', $id);
  $stmt->execute();
  respond(['success' => true, 'message' => 'Data dapur berhasil dihapus.']);
}

respond(['success' => false, 'message' => 'Method tidak diizinkan.'], 405);
?>
