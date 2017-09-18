<?php

require_once($_SERVER['DOCUMENT_ROOT'].'/assets/includes/global/php/redis-session-start.php');
require_once ($_SERVER['DOCUMENT_ROOT'].'/assets/includes/global/php/sanitize-data.php');

class sessionVariable {
    private $vals;
    function __construct($data)
    {
        $this->vals = explode(":",sanitizeInput($data));
        switch(sizeof($this->vals)) {
            case '1': {     //for 1D session variables. Eg: $_SESSION['id']
                if(isset($_SESSION[$this->vals[0]])) {
                    if (!is_array(decodeInput($_SESSION[$this->vals[0]]))) {
                        echo decodeInput($_SESSION[$this->vals[0]]);
                    }
                }
                break;
            }
            case '2': {     //for 2D session variables and output to textbox, textarea . Eg: $_SESSION['form']['id']
                if(isset($_SESSION[$this->vals[0]][$this->vals[1]])) {
                    if (!is_array(decodeInput($_SESSION[$this->vals[0]][$this->vals[1]]))) {
                        if ($this->vals[1] == 'cidm-valid') {
                            if(decodeInput($_SESSION[$this->vals[0]][$this->vals[1]])=='invalid') {
                                echo '<div class="status warn"><div class="inner">Invalid CIDM authentication</div></div>';
                            }
                        } else {
                            echo decodeInput($_SESSION[$this->vals[0]][$this->vals[1]]);
                        }

                    }
                }
                break;
            }
            case '3': {     //for 2D session variables and output to radio checkbox . Eg: $_SESSION['form']['id'] . outputs 'checked'
                if(isset($_SESSION[$this->vals[0]][$this->vals[1]])) {
                  if(($this->vals[2] == decodeInput($_SESSION[$this->vals[0]][$this->vals[1]])) || (in_array($this->vals[2],decodeInput($_SESSION[$this->vals[0]][$this->vals[1]])))) {
                        echo "checked";
                    }
                }
                break;
            }
            case '4': {     //for 2D session variables and output to select options . Eg: $_SESSION['form']['id'] . outputs 'selected'
                if(isset($_SESSION[$this->vals[0]][$this->vals[1]]) && $this->vals[3]=='select') {
                    if($this->vals[2] == decodeInput($_SESSION[$this->vals[0]][$this->vals[1]])) {
                        echo "selected";
                    }
                }
            }
        }
    }
}