<?php
declare(strict_types=1);

function connectDatabase(): PDO
{
    return new PDO(
        getenv('PLATINUM_DB_DSN')
            ?: 'mysql:host=127.0.0.1;port=3306;dbname=platinum_cars;charset=utf8mb4',
        getenv('PLATINUM_DB_USER') ?: 'root',
        getenv('PLATINUM_DB_PASSWORD') ?: '',
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ]
    );
}