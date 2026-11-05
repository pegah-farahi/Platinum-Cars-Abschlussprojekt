<?php
declare(strict_types=1);
require_once __DIR__ . '/../../database.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $database = connectDatabase();

    $rows = $database->query(
        "SELECT v.*, i.image_path
         FROM vehicles AS v
         LEFT JOIN vehicle_images AS i ON i.vehicle_id = v.id
         WHERE v.status = 'available'
         ORDER BY v.id, i.position"
    );

    $vehicles = [];
    foreach ($rows as $row) {
        $id = (int) $row['id'];
        if (!isset($vehicles[$id])) {
            $power = (int) $row['power_kw'];
            $price = (float) $row['price_eur'];
            $vehicles[$id] = [
                'id' => $id,
                'title' => $row['brand'] . ' ' . $row['model'],
                'brand' => $row['brand'],
                'model' => $row['model'],
                'firstRegistration' => sprintf('%02d/%d', $row['first_registration_month'], $row['first_registration_year']),
                'mileage' => number_format((int) $row['mileage_km'], 0, ',', '.'),
                'fuel' => $row['fuel'],
                'power' => sprintf('%d kW (%d PS)', $power, round($power * 1.35962)),
                'price' => number_format($price, floor($price) === $price ? 0 : 2, ',', '.'),
                'priceEur' => $price,
                'transmission' => $row['transmission'],
                'exteriorColor' => $row['exterior_color'],
                'description' => $row['description'],
                'equipment' => $row['equipment'],
                'technicalDetails' => json_decode($row['technical_details'] ?? '{}', true),
                'financingExample' => json_decode($row['financing_example'] ?? 'null', true),
                'images' => [],
            ];
        }
        if ($row['image_path'] !== null) {
            $vehicles[$id]['images'][] = $row['image_path'];
        }
    }

    echo json_encode(array_values($vehicles), JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
} catch (PDOException | JsonException $error) {
    error_log($error->getMessage());
    http_response_code(500);
    echo '{"error":"Fahrzeugdaten konnten nicht geladen werden."}';
}
