<?php
require_once ($_SERVER['DOCUMENT_ROOT'].'/assets/includes/global/php/sanitize-data.php');

if(isset($_SERVER['HTTP_X_FORWARDED_HOST']) || isset($_SERVER['HTTP_HOST'])) {
    $host = isset($_SERVER['HTTP_HOST']) ? sanitizeInput($_SERVER['HTTP_HOST']) : sanitizeInput($_SERVER['HTTP_X_FORWARDED_HOST']);
    switch ($host) {
        case "swe.localhost.dev":
            define('MASTERIP','167.123.61.89');
            define('MASTERPORT','6379');
            define('MASTERPASS','redis_pass_01');
            define('SLAVEIP','167.123.61.1');
            define('SLAVEPORT','6379');
            define('SLAVEPASS','redis_pass_01');
            break;

        case "qld-dev.ssq.qld.gov.au":
            define('MASTERIP','10.0.3.133');
            define('MASTERPORT','6379');
            define('MASTERPASS','uatwebsadlkfj3lkjsdalfkjasdlk5jl64k4j56lkjsdlfkj4lkjlskdfjlk3');
            define('SLAVEIP','');
            define('SLAVEPORT','');
            define('SLAVEPASS','');
            break;

        case "qld-uat.ssq.qld.gov.au":
            define('MASTERIP','10.0.2.5');
            define('MASTERPORT','6379');
            define('MASTERPASS','5957700444957346384454748593629116118152750784534180874653018151062898365355920340320005506341769948');
            define('SLAVEIP','10.0.2.244');
            define('SLAVEPORT','6379');
            define('SLAVEPASS','5957700444957346384454748593629116118152750784534180874653018151062898365355920340320005506341769948');
            break;

        case "qld-beta.ssq.qld.gov.au":
            define('MASTERIP','10.0.2.5');
            define('MASTERPORT','6379');
            define('MASTERPASS','5957700444957346384454748593629116118152750784534180874653018151062898365355920340320005506341769948');
            define('SLAVEIP','10.0.2.244');
            define('SLAVEPORT','6379');
            define('SLAVEPASS','5957700444957346384454748593629116118152750784534180874653018151062898365355920340320005506341769948');
            break;

        case "qld-beta.ssq.qld.gov.au":
            define('MASTERIP','10.0.2.5');
            define('MASTERPORT','6379');
            define('MASTERPASS','5957700444957346384454748593629116118152750784534180874653018151062898365355920340320005506341769948');
            define('SLAVEIP','10.0.2.244');
            define('SLAVEPORT','6379');
            define('SLAVEPASS','5957700444957346384454748593629116118152750784534180874653018151062898365355920340320005506341769948');
            break;
    }
}

$redis = new Redis();
try {
    $redis->connect(MASTERIP, MASTERPORT);
    $redis->auth(MASTERPASS);
    ini_set('session.save_handler','redis');
    ini_set('session.save_path','tcp://'.MASTERIP.':'.MASTERPORT.'?auth='.MASTERPASS);
}
catch (Exception $e) {
    try {
        $redis->connect(SLAVEIP, SLAVEPORT);
        $redis->auth(SLAVEPASS);
        ini_set('session.save_handler','redis');
        ini_set('session.save_path','tcp://'.SLAVEIP.':'.SLAVEPORT.'?auth='.SLAVEPASS);
    }
    catch (Exception $e) {
        echo "Unable to retrieve . Please try again";
    }
}
session_start();
//print_r($_SESSION);