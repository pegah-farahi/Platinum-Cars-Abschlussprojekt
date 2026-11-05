USE platinum_cars;

CREATE TABLE IF NOT EXISTS service_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  request_type ENUM('contact', 'appointment') NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(254) NOT NULL,
  phone VARCHAR(40),
  vehicle_description VARCHAR(200),
  preferred_date DATE,
  preferred_time TIME,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('new', 'confirmed', 'declined') NOT NULL DEFAULT 'new'
) ENGINE=InnoDB;
