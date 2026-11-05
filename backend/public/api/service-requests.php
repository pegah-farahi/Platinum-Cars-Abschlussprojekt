<?php
declare(strict_types=1);
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
    respond(405, ['error' => 'Bitte verwenden Sie das Anfrageformular.']);
}
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 12000) {
    respond(413, ['error' => 'Die Anfrage ist zu lang.']);
}
$values = [];
$limits = ['request_type' => 20, 'name' => 150, 'email' => 254, 'phone' => 40,
    'vehicle_description' => 200, 'preferred_date' => 10, 'preferred_time' => 5, 'message' => 4000];
foreach ($limits as $field => $limit) {
    $value = $_POST[$field] ?? '';
    if (!is_string($value) || strlen($value) > $limit * 4) {
        respond(422, ['error' => 'Bitte prüfen Sie Ihre Eingaben.']);
    }
    $values[$field] = trim($value);
    if (mb_strlen($values[$field], 'UTF-8') > $limit) {
        respond(422, ['error' => 'Ein Eingabefeld ist zu lang.']);
    }
}
if (!in_array($values['request_type'], ['contact', 'appointment'], true)
    || $values['name'] === '' || $values['message'] === ''
    || !filter_var($values['email'], FILTER_VALIDATE_EMAIL)) {
    respond(422, ['error' => 'Bitte geben Sie Name, gültige E-Mail und Ihr Anliegen an.']);
}
$date = $values['preferred_date'];
if ($values['request_type'] === 'appointment' && $date === '') {
    respond(422, ['error' => 'Bitte wählen Sie ein Wunschdatum.']);
}
if ($date !== '') {
    $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
    if (!$parsed || $parsed->format('Y-m-d') !== $date || $date < date('Y-m-d')) {
        respond(422, ['error' => 'Bitte wählen Sie ein gültiges Datum ab heute.']);
    }
}
$time = $values['preferred_time'];
if ($time !== '' && ($date === '' || !preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $time))) {
    respond(422, ['error' => 'Bitte prüfen Sie Datum und Uhrzeit.']);
}
try {
    $database = new PDO(
        getenv('PLATINUM_DB_DSN') ?: 'mysql:host=127.0.0.1;port=3306;dbname=platinum_cars;charset=utf8mb4',
        getenv('PLATINUM_DB_USER') ?: 'root',
        getenv('PLATINUM_DB_PASSWORD') ?: '',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    $statement = $database->prepare(
        'INSERT INTO service_requests
         (request_type, name, email, phone, vehicle_description, preferred_date, preferred_time, message)
         VALUES (:request_type, :name, :email, :phone, :vehicle_description, :preferred_date, :preferred_time, :message)'
    );
    foreach (['phone', 'vehicle_description', 'preferred_date', 'preferred_time'] as $optional) {
        if ($values[$optional] === '') $values[$optional] = null;
    }
    $statement->execute($values);
    respond(201, ['id' => (int) $database->lastInsertId(), 'message' => 'Ihre Anfrage wurde gespeichert. Ein Termin wird erst nach unserer Bestätigung verbindlich.']);
} catch (PDOException $error) {
    error_log($error->getMessage());
    respond(500, ['error' => 'Die Anfrage konnte nicht gespeichert werden. Bitte kontaktieren Sie uns telefonisch oder per E-Mail.']);
}
