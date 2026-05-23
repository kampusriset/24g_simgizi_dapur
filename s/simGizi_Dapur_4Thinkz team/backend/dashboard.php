<?php
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/koneksi.php';

$stats = $conn->query("SELECT
  COUNT(*) AS total_dapur,
  SUM(status = 'Aktif') AS dapur_aktif,
  SUM(status <> 'Aktif') AS dapur_nonaktif,
  SUM(kontak IS NULL OR kontak = '') AS kontak_kosong
  FROM dapur")->fetch_assoc();

$mitra = $conn->query('SELECT COUNT(*) AS total_mitra FROM mitra')->fetch_assoc();
$latest = $conn->query("SELECT d.nama_dapur, d.penanggung_jawab, d.status, COALESCE(m.nama_mitra, '-') AS nama_mitra
  FROM dapur d LEFT JOIN mitra m ON m.id_mitra = d.id_mitra
  ORDER BY d.id_dapur DESC LIMIT 5")->fetch_all(MYSQLI_ASSOC);
$top = $conn->query("SELECT m.nama_mitra, m.jenis_mitra, COUNT(d.id_dapur) AS total_dapur
  FROM mitra m LEFT JOIN dapur d ON d.id_mitra = m.id_mitra
  GROUP BY m.id_mitra, m.nama_mitra, m.jenis_mitra
  ORDER BY total_dapur DESC, m.nama_mitra ASC LIMIT 5")->fetch_all(MYSQLI_ASSOC);

respond([
  'success' => true,
  'stats' => [
    'total_dapur' => (int) $stats['total_dapur'],
    'dapur_aktif' => (int) $stats['dapur_aktif'],
    'dapur_nonaktif' => (int) $stats['dapur_nonaktif'],
    'kontak_kosong' => (int) $stats['kontak_kosong'],
    'total_mitra' => (int) $mitra['total_mitra']
  ],
  'latest' => $latest,
  'top_mitra' => $top
]);
?>
