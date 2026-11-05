<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit;
}

require_once __DIR__ . '/mailer.php';

try {
    sendProjectEmail(
        'Platinum Cars – E-Mail-Test',
        "Hallo Pegah!\n\nDer E-Mail-Versand aus deinem PHP-Projekt funktioniert."
    );

    echo "Test-E-Mail wurde gesendet." . PHP_EOL;
} catch (Throwable $error) {
    echo "E-Mail konnte nicht gesendet werden." . PHP_EOL;
    echo $error->getMessage() . PHP_EOL;
    exit(1);
}