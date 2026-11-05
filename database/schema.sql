CREATE DATABASE IF NOT EXISTS platinum_cars
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE platinum_cars;

CREATE TABLE IF NOT EXISTS vehicles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  brand VARCHAR(80) NOT NULL,
  model VARCHAR(150) NOT NULL,
  price_eur DECIMAL(10, 2) UNSIGNED NOT NULL,
  first_registration_year SMALLINT UNSIGNED NOT NULL,
  first_registration_month TINYINT UNSIGNED NOT NULL,
  mileage_km INT UNSIGNED NOT NULL,
  fuel VARCHAR(40) NOT NULL,
  power_kw SMALLINT UNSIGNED NOT NULL,
  transmission VARCHAR(40),
  exterior_color VARCHAR(80),
  description TEXT,
  equipment TEXT,
  status ENUM('available', 'sold', 'draft') NOT NULL DEFAULT 'draft',
  CHECK (first_registration_month BETWEEN 1 AND 12)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vehicle_images (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT UNSIGNED NOT NULL,
  image_path VARCHAR(512) NOT NULL,
  position SMALLINT UNSIGNED NOT NULL,
  UNIQUE (vehicle_id, position),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS appointment_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(254) NOT NULL,
  phone VARCHAR(40),
  preferred_date DATE NOT NULL,
  preferred_time TIME,
  message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('new', 'confirmed', 'declined') NOT NULL DEFAULT 'new',
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
