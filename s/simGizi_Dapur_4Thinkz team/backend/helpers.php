<?php
header('Content-Type: application/json; charset=utf-8');

function json_input() {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  return is_array($data) ? $data : $_POST;
}

function respond($data, $status = 200) {
  http_response_code($status);
  echo json_encode($data);
  exit;
}

function require_fields($data, $fields) {
  foreach ($fields as $field) {
    if (!isset($data[$field]) || trim((string) $data[$field]) === '') {
      respond([
        'success' => false,
        'message' => 'Field ' . $field . ' wajib diisi.'
      ], 422);
    }
  }
}
?>
