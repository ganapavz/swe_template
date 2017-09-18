<?php
if(isset($_POST)){

    require_once ('form-handler.php');
    $formHandler = new formHandler($_POST);

    $formHandler->saveSessionVars();
    $formHandler->submission($_POST['submit-type']);
}