CREATE DATABASE IF NOT EXISTS simgizi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE simgizi;

CREATE TABLE IF NOT EXISTS users (
  id_user INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nama VARCHAR(100) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mitra (
  id_mitra INT AUTO_INCREMENT PRIMARY KEY,
  nama_mitra VARCHAR(100) NOT NULL,
  jenis_mitra VARCHAR(50) NOT NULL,
  kontak VARCHAR(20),
  email VARCHAR(100),
  alamat TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'Aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dapur (
  id_dapur INT AUTO_INCREMENT PRIMARY KEY,
  nama_dapur VARCHAR(100) NOT NULL,
  alamat TEXT,
  penanggung_jawab VARCHAR(100),
  kontak VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'Aktif',
  id_mitra INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_dapur_mitra
    FOREIGN KEY (id_mitra)
    REFERENCES mitra(id_mitra)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

INSERT INTO users (id_user, username, password, nama, role) VALUES
(1, 'admin', '$2y$10$CnFD.fwcPXGnF8wkz9NjiOSzvK9wkRbWjNSqKVswDLtUoVXwmUbFK', 'Administrator', 'admin')
ON DUPLICATE KEY UPDATE
  username = VALUES(username),
  password = VALUES(password),
  nama = VALUES(nama),
  role = VALUES(role);

INSERT INTO mitra (id_mitra, nama_mitra, jenis_mitra, kontak, email, alamat, status) VALUES
(1, 'PT Gizi Indonesia', 'Perusahaan', '08123456789', 'info@giziid.com', 'Jl. Merdeka No. 10', 'Aktif'),
(2, 'Yayasan 4THINKZt', 'Yayasan', '+62 882-2874-1963', 'contact@4thinkzt.org', 'Jl. Pendidikan No. 4', 'Aktif')
ON DUPLICATE KEY UPDATE
  nama_mitra = VALUES(nama_mitra),
  jenis_mitra = VALUES(jenis_mitra),
  kontak = VALUES(kontak),
  email = VALUES(email),
  alamat = VALUES(alamat),
  status = VALUES(status);

INSERT INTO dapur (id_dapur, nama_dapur, alamat, penanggung_jawab, kontak, status, id_mitra) VALUES
(1, 'Dapur Makan Bergizi', 'Jl. Bergizi No. 2', 'RHIN FOUNDATION', '+62 882-2874-1963', 'Aktif', 2),
(2, 'Dapur Sehat Nusantara', 'Jl. Sehat No. 1', 'Budi Santoso', '08123456789', 'Aktif', 1)
ON DUPLICATE KEY UPDATE
  nama_dapur = VALUES(nama_dapur),
  alamat = VALUES(alamat),
  penanggung_jawab = VALUES(penanggung_jawab),
  kontak = VALUES(kontak),
  status = VALUES(status),
  id_mitra = VALUES(id_mitra);
