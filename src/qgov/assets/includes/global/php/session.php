<?php

if(isset($_GET['val'])){
    require_once ('retrieve-session-variable.php');
    $session = new sessionVariable($_GET['val']);
}

//setup apache with the following rule to redirect virtual='swe.session{}' to this page
//RewriteRule ^.*swe\.session{(.*)}$ /assets/includes/global/php/session.php?val=$1 [NE,NC]