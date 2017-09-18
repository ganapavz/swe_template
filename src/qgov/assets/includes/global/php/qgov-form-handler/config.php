<?php
require_once ($_SERVER['DOCUMENT_ROOT'].'/assets/includes/global/php/sanitize-data.php');

if(isset($_SERVER['HTTP_X_FORWARDED_HOST']) || isset($_SERVER['HTTP_HOST'])) {
    $host = isset($_SERVER['HTTP_HOST']) ? sanitizeInput($_SERVER['HTTP_HOST']) : sanitizeInput($_SERVER['HTTP_X_FORWARDED_HOST']);
    switch ($host) {
        case "swe.localhost.dev": {
            $proxy = '167.123.61.1:3128';
            break;
        }
        default: {
            $proxy = '';
            break;
        }
    }
}
