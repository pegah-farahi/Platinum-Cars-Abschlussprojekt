<?php
declare(strict_types=1);
require_once __DIR__ . '/../../database.php';
require_once __DIR__ . '/../../mailer.php';
date_default_timezone_set('Europe/Berlin');
header('Content-Type: application/json; charset=utf-8');

function respond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, ['error' => 'Bitte das Anfrageformular verwenden.']);
}
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 12000) {
    respond(413, ['error' => 'Die Anfrage ist zu lang.']);
}
$values = [];
$limits = ['request_type' => 20, 'name' => 150, 'email' => 254, 'phone' => 40,
    'vehicle_description' => 200, 'preferred_date' => 10, 'preferred_time' => 5, 'message' => 4000];
foreach ($limits as $field => $limit) {
    $value = $_POST[$field] ?? '';
    if (!is_string($value) || !mb_check_encoding($value, 'UTF-8') || strlen($value) > $limit * 4) {
        respond(422, ['error' => 'Bitte die Eingaben prüfen.']);
    }
    $values[$field] = trim($value);
    if (mb_strlen($values[$field], 'UTF-8') > $limit) {
        respond(422, ['error' => 'Ein Eingabefeld ist zu lang.']);
    }
}
if (!in_array($values['request_type'], ['contact', 'appointment'], true)
    || $values['name'] === '' || $values['message'] === ''
    || !filter_var($values['email'], FILTER_VALIDATE_EMAIL)) {
    respond(422, ['error' => 'Bitte Name, gültige E-Mail und Anliegen angeben.']);
}
$date = $values['preferred_date'];
if ($values['request_type'] === 'appointment' && $date === '') {
    respond(422, ['error' => 'Bitte ein Wunschdatum wählen.']);
}
if ($date !== '') {
    $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
    if (!$parsed || $parsed->format('Y-m-d') !== $date || $date < date('Y-m-d')) {
        respond(422, ['error' => 'Bitte ein gültiges Datum ab heute wählen.']);
    }
}
$time = $values['preferred_time'];
if ($time !== '' && ($date === '' || !preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $time))) {
    respond(422, ['error' => 'Bitte Datum und Uhrzeit prüfen.']);
}
try {
    $database = connectDatabase();
    foreach (['phone', 'vehicle_description', 'preferred_date', 'preferred_time'] as $optional) {
        if ($values[$optional] === '') $values[$optional] = null;
    }

    // Serialize requests from the same email, including simultaneous submissions.
    $lockName = hash('sha256', 'platinum-service-' . strtolower($values['email']));
    $lockQuery = $database->prepare('SELECT GET_LOCK(:lock_name, 5)');
    $lockQuery->execute(['lock_name' => $lockName]);
    if ((int) $lockQuery->fetchColumn() !== 1) {
        respond(503, ['error' => 'Eine Anfrage wird noch verarbeitet. Bitte kurz warten und erneut versuchen.']);
    }

    $duplicateQuery = $database->prepare(
        "SELECT id FROM service_requests
         WHERE request_type = :request_type AND email = :email
           AND vehicle_description <=> :vehicle_description
           AND preferred_date <=> CAST(:preferred_date AS DATE)
           AND preferred_time <=> CAST(:preferred_time AS TIME)
           AND status IN ('new', 'confirmed')
           AND (:type_check = 'appointment' OR message = :message)
         LIMIT 1"
    );
    $duplicateQuery->execute([
        'request_type' => $values['request_type'],
        'email' => $values['email'],
        'vehicle_description' => $values['vehicle_description'],
        'preferred_date' => $values['preferred_date'],
        'preferred_time' => $values['preferred_time'],
        'type_check' => $values['request_type'],
        'message' => $values['message'],
    ]);
    $existingId = $duplicateQuery->fetchColumn();
    if ($existingId !== false) {
        $release = $database->prepare('SELECT RELEASE_LOCK(:lock_name)');
        $release->execute(['lock_name' => $lockName]);
        respond(200, ['id' => (int) $existingId, 'message' => 'Diese Anfrage wurde bereits gespeichert. Wir melden uns per E-Mail oder Telefon.']);
    }
    $statement = $database->prepare(
        'INSERT INTO service_requests
         (request_type, name, email, phone, vehicle_description, preferred_date, preferred_time, message)
         VALUES (:request_type, :name, :email, :phone, :vehicle_description, :preferred_date, :preferred_time, :message)'
    );
    $statement->execute($values);
    $requestId = (int) $database->lastInsertId();
    $release = $database->prepare('SELECT RELEASE_LOCK(:lock_name)');
    $release->execute(['lock_name' => $lockName]);

    $responseMessage = 'Die Anfrage wurde gespeichert.';
    if ($values['request_type'] === 'appointment') {
        $responseMessage .= ' Ein Termin wird erst nach unserer Bestätigung verbindlich.';
    }
    $requestLabel = $values['request_type'] === 'appointment' ? 'Werkstatt-Terminanfrage' : 'Werkstatt-Kontaktanfrage';
    $body = implode(PHP_EOL, [
        $requestLabel,
        '',
        'Anfrage-Nr.: ' . $requestId,
        'Name: ' . $values['name'],
        'E-Mail: ' . $values['email'],
        'Telefon: ' . ($values['phone'] ?? 'Nicht angegeben'),
        'Fahrzeug: ' . ($values['vehicle_description'] ?? 'Nicht angegeben'),
        'Wunschdatum: ' . ($values['preferred_date'] ?? 'Nicht angegeben'),
        'Wunschzeit: ' . ($values['preferred_time'] ?? 'Nicht angegeben'),
        '',
        'Anliegen:',
        $values['message'],
    ]);
    try {
        sendProjectEmail('Platinum Cars – ' . $requestLabel . ' #' . $requestId, $body);
    } catch (Throwable $mailError) {
        error_log('E-Mail-Versand fehlgeschlagen für Werkstattanfrage #' . $requestId);
        $responseMessage .= ' Die E-Mail-Benachrichtigung konnte nicht gesendet werden.';
    }
    respond(201, ['id' => $requestId, 'message' => $responseMessage]);
} catch (PDOException $error) {
    // Closing the connection also releases an advisory lock after a database error.
    $database = null;
    error_log($error->getMessage());
    respond(500, ['error' => 'Die Anfrage konnte nicht gespeichert werden. Kontakt ist telefonisch oder per E-Mail möglich.']);
}
