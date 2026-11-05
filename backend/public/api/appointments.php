<?php
declare(strict_types=1);

require_once __DIR__ . '/../../database.php';
require_once __DIR__ . '/../../mailer.php';

date_default_timezone_set('Europe/Berlin');
header('Content-Type: application/json; charset=utf-8');

function respond(int $status, array $data): never
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, ['error' => 'Bitte das Anfrageformular verwenden.']);
}

if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 20000) {
    respond(413, ['error' => 'Die Anfrage ist zu lang.']);
}

$limits = [
    'vehicle_id' => 10,
    'name' => 150,
    'email' => 254,
    'phone' => 40,
    'preferred_date' => 10,
    'preferred_time' => 5,
    'message' => 4000,
];

$values = [];

foreach ($limits as $field => $limit) {
    $value = $_POST[$field] ?? '';

    if (
        !is_string($value)
        || !mb_check_encoding($value, 'UTF-8')
        || mb_strlen($value, 'UTF-8') > $limit
    ) {
        respond(422, ['error' => 'Bitte die Eingaben prüfen.']);
    }

    $values[$field] = trim($value);
}

$vehicleId = filter_var(
    $values['vehicle_id'],
    FILTER_VALIDATE_INT,
    ['options' => ['min_range' => 1]]
);

if (
    $vehicleId === false
    || $values['name'] === ''
    || !filter_var($values['email'], FILTER_VALIDATE_EMAIL)
) {
    respond(422, ['error' => 'Bitte Fahrzeug, Name und E-Mail prüfen.']);
}

$date = DateTimeImmutable::createFromFormat(
    '!Y-m-d',
    $values['preferred_date']
);

if (
    !$date
    || $date->format('Y-m-d') !== $values['preferred_date']
    || $date < new DateTimeImmutable('today')
) {
    respond(422, ['error' => 'Bitte ein gültiges Datum ab heute wählen.']);
}

$time = $values['preferred_time'];

if ($time !== '' && !preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $time)) {
    respond(422, ['error' => 'Bitte die Uhrzeit prüfen.']);
}

try {
    $database = connectDatabase();
    $database->beginTransaction();
    $vehicleQuery = $database->prepare(
    "SELECT brand, model
     FROM vehicles
     WHERE id = :id AND status = 'available'
     FOR UPDATE"
);

$vehicleQuery->execute(['id' => $vehicleId]);
$vehicle = $vehicleQuery->fetch(PDO::FETCH_ASSOC);

if (!$vehicle) {
    $database->rollBack();
    respond(409, ['error' => 'Dieses Fahrzeug ist nicht mehr verfügbar.']);
}

$vehicleTitle = $vehicle['brand'] . ' ' . $vehicle['model'];
$duplicateQuery = $database->prepare(
    "SELECT id
     FROM appointment_requests
     WHERE vehicle_id = :vehicle_id
       AND email = :email
       AND preferred_date = :preferred_date
       AND preferred_time <=> CAST(:preferred_time AS TIME)
       AND status IN ('new', 'confirmed')
     LIMIT 1
     FOR UPDATE"
);

$duplicateQuery->execute([
    'vehicle_id' => $vehicleId,
    'email' => $values['email'],
    'preferred_date' => $values['preferred_date'],
    'preferred_time' => $time === '' ? null : $time,
]);

$existingRequest = $duplicateQuery->fetch(PDO::FETCH_ASSOC);

if ($existingRequest) {
    $database->rollBack();

    respond(200, [
        'id' => (int) $existingRequest['id'],
        'message' => 'Diese Anfrage wurde bereits gespeichert. Wir melden uns per E-Mail oder Telefon.',
    ]);
}

    $statement = $database->prepare(
        "INSERT INTO appointment_requests
            (vehicle_id, name, email, phone, preferred_date, preferred_time, message)
         SELECT id, :name, :email, :phone, :preferred_date, :preferred_time, :message
         FROM vehicles
         WHERE id = :vehicle_id AND status = 'available'"
    );

    $statement->execute([
        'vehicle_id' => $vehicleId,
        'name' => $values['name'],
        'email' => $values['email'],
        'phone' => $values['phone'] === '' ? null : $values['phone'],
        'preferred_date' => $values['preferred_date'],
        'preferred_time' => $time === '' ? null : $time,
        'message' => $values['message'] === '' ? null : $values['message'],
    ]);

    if ($statement->rowCount() === 0) {
        $database->rollBack();
        respond(409, ['error' => 'Dieses Fahrzeug ist nicht mehr verfügbar.']);
    }

  $requestId = (int) $database->lastInsertId();
  $database->commit();

$responseMessage = 'Die Anfrage wurde gespeichert. Der Termin wird nach unserer Bestätigung verbindlich.';

$emailBody = implode(PHP_EOL, [
    'Neue Besichtigungsanfrage',
    '',
    'Anfrage-Nr.: ' . $requestId,
    'Fahrzeug: ' . $vehicleTitle,
    'Fahrzeug-ID: ' . $vehicleId,
    'Name: ' . $values['name'],
    'E-Mail: ' . $values['email'],
    'Telefon: ' . ($values['phone'] ?: 'Nicht angegeben'),
    'Wunschdatum: ' . $values['preferred_date'],
    'Wunschzeit: ' . ($time ?: 'Nicht angegeben'),
    '',
    'Nachricht:',
    $values['message'] ?: 'Keine Nachricht',
]);

try {
    sendProjectEmail(
        'Platinum Cars – Besichtigungsanfrage #' . $requestId,
        $emailBody
    );
} catch (Throwable $mailError) {
    error_log('E-Mail-Versand fehlgeschlagen für Anfrage #' . $requestId);

    $responseMessage .= ' Die E-Mail-Benachrichtigung konnte nicht gesendet werden.';
}

respond(201, [
    'id' => $requestId,
    'message' => $responseMessage,
]);

} catch (PDOException $error) {
    if (isset($database) && $database->inTransaction()) {
    $database->rollBack();
}
    error_log($error->getMessage());

    respond(500, [
        'error' => 'Die Anfrage konnte nicht gespeichert werden. Kontakt ist telefonisch möglich.',
    ]);
}