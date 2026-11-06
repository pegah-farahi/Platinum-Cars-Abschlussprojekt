<?php
declare(strict_types=1);

// CLI only: import verified listing data without replacing vehicle or request IDs.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
require_once __DIR__ . '/database.php';
$root = dirname(__DIR__);
$data = json_decode(file_get_contents($root . '/database/selected-vehicle-content.json'), true, 512, JSON_THROW_ON_ERROR);
$database = connectDatabase();
foreach ($data['vehicles'] as $vehicle) {
    foreach ($vehicle['images'] as $image) {
        if (!is_file($root . '/frontend/public' . $image['path'])) {
            throw new RuntimeException('Missing image: ' . $image['path']);
        }
    }
}

$database->beginTransaction();
try {
    $identities = $database->query('SELECT id, brand, model FROM vehicles WHERE id IN (1, 2, 3, 4) FOR UPDATE')->fetchAll(PDO::FETCH_UNIQUE | PDO::FETCH_ASSOC);
    foreach ($data['vehicles'] as $vehicle) {
        $existing = $identities[$vehicle['id']] ?? null;
        if (!$existing || $existing['brand'] !== $vehicle['brand'] || $existing['model'] !== $vehicle['model']) {
            throw new RuntimeException('Vehicle identity mismatch; import cancelled.');
        }
    }

    // Local backup stays in ignored tmp/, never in the public directory or Git.
    $backupDirectory = $root . '/tmp/vehicle-backups';
    if (!is_dir($backupDirectory)) mkdir($backupDirectory, 0777, true);
    $backup = [
        'vehicles' => $database->query('SELECT * FROM vehicles WHERE id IN (1, 2, 3, 4)')->fetchAll(PDO::FETCH_ASSOC),
        'images' => $database->query('SELECT * FROM vehicle_images WHERE vehicle_id IN (1, 2, 3, 4)')->fetchAll(PDO::FETCH_ASSOC),
    ];
    if (file_put_contents($backupDirectory . '/' . date('Ymd-His') . '-' . bin2hex(random_bytes(3)) . '.json', json_encode($backup, JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
        throw new RuntimeException('Backup failed; import cancelled.');
    }

    $update = $database->prepare('UPDATE vehicles SET price_eur = :price, transmission = :transmission, exterior_color = :color, description = :description, equipment = :equipment, technical_details = :details, financing_example = :financing WHERE id = :id');
    $imageQuery = $database->prepare('INSERT INTO vehicle_images (vehicle_id, image_path, position) VALUES (:vehicle_id, :path, :position) ON DUPLICATE KEY UPDATE image_path = VALUES(image_path)');
    foreach ($data['vehicles'] as $vehicle) {
        if (isset($vehicle['technicalDetails'])) {
            $update->execute([
                'price' => $vehicle['priceEur'],
                'transmission' => $vehicle['transmission'],
                'color' => $vehicle['exteriorColor'],
                'description' => $vehicle['description'],
                'equipment' => implode("\n", $vehicle['equipment']),
                'details' => json_encode($vehicle['technicalDetails'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE),
                'financing' => $vehicle['financingExample'] === null ? null : json_encode($vehicle['financingExample'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE),
                'id' => $vehicle['id'],
            ]);
        }
        foreach ($vehicle['images'] as $index => $image) {
            $imageQuery->execute(['vehicle_id' => $vehicle['id'], 'path' => $image['path'], 'position' => $index + 1]);
        }
    }
    $database->commit();
    echo "Selected vehicle data imported; other vehicles and all requests preserved.\n";
} catch (Throwable $error) {
    if ($database->inTransaction()) $database->rollBack();
    throw $error;
}
