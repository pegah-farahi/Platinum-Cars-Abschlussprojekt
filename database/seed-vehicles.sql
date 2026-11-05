-- Demo inventory from the mobile.de dealer snapshot reviewed 2026-11-04.
-- https://home.mobile.de/PLATINUMCARSSOLINGEN
-- IDs 1–3 match the selected cars in the React homepage.
-- Reimport preserves existing rows and appointment requests.
USE platinum_cars;
START TRANSACTION;

INSERT INTO vehicles
  (id, brand, model, price_eur, first_registration_year,
   first_registration_month, mileage_km, fuel, power_kw, status)
VALUES
  (1, 'Audi', 'A3 Sportback', 12900, 2013, 9, 43900, 'Benzin', 90, 'available'),
  (2, 'Mercedes-Benz', 'CLA 180', 11900, 2013, 8, 150000, 'Benzin', 90, 'available'),
  (3, 'Ford', 'Focus Trend', 9800, 2018, 7, 44000, 'Benzin', 74, 'available'),
  (4, 'Audi', 'A5 Sportback 2.0 TFSI', 13999, 2013, 1, 150000, 'Benzin', 155, 'available'),
  (5, 'Volvo', 'V70 Kombi', 6490, 2010, 12, 136900, 'Diesel', 80, 'available'),
  (6, 'Mercedes-Benz', 'C 180 T-Modell Avantgarde', 5999, 2010, 12, 178000, 'Benzin', 115, 'available'),
  (7, 'Ford', 'Focus Turnier Titanium 1.6 TDCi', 4599, 2012, 8, 205000, 'Diesel', 77, 'available'),
  (8, 'Ford', 'Kuga Titanium 4x4', 7000, 2015, 6, 219000, 'Diesel', 132, 'available')
ON DUPLICATE KEY UPDATE id = vehicles.id;

INSERT INTO vehicle_images (vehicle_id, image_path, position)
VALUES
  (1, '/images/vehicles/audi-a3/01.webp', 1),
  (2, '/images/vehicles/mercedes-cla/01.webp', 1),
  (3, '/images/vehicles/ford-focus/01.webp', 1),
  (4, '/images/vehicles/audi-a5/01.webp', 1),
  (4, '/images/vehicles/audi-a5/02.webp', 2),
  (4, '/images/vehicles/audi-a5/03.webp', 3),
  (5, '/images/vehicles/volvo-v70/01.webp', 1),
  (6, '/images/vehicles/mercedes-c180/01.webp', 1),
  (7, '/images/vehicles/ford-focus-turnier/01.webp', 1),
  (8, '/images/vehicles/ford-kuga/01.webp', 1)
ON DUPLICATE KEY UPDATE id = vehicle_images.id;

COMMIT;
