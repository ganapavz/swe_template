<?php
function sanitizeInput($input){
    $search = array(
        '@<script[^>]*?>.*?</script>@si',   // Strip out javascript
        '@<[\/\!]*?[^<>]*?>@si',            // Strip out HTML tags
        '@<style[^>]*?>.*?</style>@siU',    // Strip style tags properly
        '@<![\s\S]*?--[ \t\n\r]*>@'         // Strip multi-line comments
    );

    $output = preg_replace($search, '', $input);
    return $output;
}
function encodeInput($input){
    $output = base64_encode(gzcompress(serialize($input)));
    return $output;
}
function decodeInput($input){
    $output = unserialize(gzuncompress(base64_decode($input)));
    return $output;
}