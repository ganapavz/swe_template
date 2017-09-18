<?php

require_once($_SERVER['DOCUMENT_ROOT'].'/assets/includes/global/php/redis-session-start.php');
require_once ($_SERVER['DOCUMENT_ROOT'].'/assets/includes/global/php/sanitize-data.php');

class formHandler {
    private $referer;
    private $formData;
    private $formName;
    private $formSubmitUrl;
    private $formReferer;

    function __construct($data)
    {
        if(isset($_SERVER['HTTP_X_FORWARDED_HOST']) || isset($_SERVER['HTTP_HOST'])) {
            $host = (isset($_SERVER['HTTPS'])?'https://':'http://').(isset($_SERVER['HTTP_HOST']) ? sanitizeInput($_SERVER['HTTP_HOST']) : sanitizeInput($_SERVER['HTTP_X_FORWARDED_HOST']));
        }
        $this->referer = isset($_SERVER['HTTP_REFERER']) ? sanitizeInput($_SERVER['HTTP_REFERER']) : '/';
        $this->formData = $data;
        if(isset($data['form-name'])){ $this->formName = sanitizeInput($data['form-name']); }
        if(isset($data['submit-to'])){ $this->formSubmitUrl = $host.sanitizeInput($data['submit-to']); }
        if(isset($data['referer'])){ $this->formReferer = sanitizeInput($data['referer']); }
    }
    public function saveSessionVars() {
        if(isset($this->formData['submit-type'])) {
            if (isset($this->formData['form-name'])) {
                foreach ($this->formData as $key => $value) {
                    $_SESSION[$this->formName][sanitizeInput($key)] = encodeInput(sanitizeInput($value));
                }
            }
        }
    }
    public function submission($type) {
        switch($type) {
            case 'Submit': {
                if(isset($this->formSubmitUrl) ) {

                    $v = self::cidmCheck();
                    if(isset($v)) {

                        if ($v == 'invalid') {
                            $_SESSION[$this->formName]['cidm-valid'] = encodeInput('invalid');
                            isset($this->formReferer) ? header('location:' . $this->formReferer) : header('location:' . $this->referer);
                            exit;
                        } else {
                            $_SESSION[$this->formName]['cidm-valid'] = encodeInput($v);
                        }
                    }
                    else {
                        if(isset($_SESSION[$this->formName]['cidm-valid'])){
                            unset($_SESSION[$this->formName]['cidm-valid']);
                        }
                    }

                    self::curlSubmit();

                    exit;
                }
                else {
                    header('location:'.$this->referer);
                    exit;
                }
                break;
            }
            case 'Login': {
                require_once ($_SERVER['DOCUMENT_ROOT'].'/assets/apps/cidm/config.php');
                if(isset($this->formReferer)) {
                    header('location:' . LOGINLOGOUTURL . 'true' . '&formref=' . $this->formReferer);         //after authentication navigates back to validation page where this file has been called
                }
                else {
                    header('location:' . LOGINLOGOUTURL . 'true' . '&formref=' . $this->referer);         //after authentication navigates back to validation page where this file has been called
                }
                exit;
                break;
            }
            case 'Logout': {
                require_once ($_SERVER['DOCUMENT_ROOT'].'/assets/apps/cidm/config.php');
                if(isset($this->formReferer)) {
                    header('location:' . LOGINLOGOUTURL . 'false' . '&formref=' . $this->formReferer);         //after authentication navigates back to validation page where this file has been called
                }
                else {
                    header('location:' . LOGINLOGOUTURL . 'false' . '&formref=' . $this->referer);         //after authentication navigates back to validation page where this file has been called
                }
                exit;
                break;
            }
        }
    }
    public function cidmCheck($value = '') {
        if(isset($_SESSION['cidm-userAuthenticated'])) {
            switch ($value) {
                case 'qid': {
                    if (isset($_SESSION[$this->formName]['cidm-qid']) && isset($_SESSION['cidm-userQid'])) {
                        if (decodeInput($_SESSION[$this->formName]['cidm-qid']) != decodeInput($_SESSION['cidm-userQid'])) {
                            return 'invalid';
                            exit;
                        }
                        else {
                            return 'yes';
                        }
                    }
                    break;
                }
                case 'email': {
                    if(isset($_SESSION[$this->formName]['cidm-email']) && isset($_SESSION['cidm-userEmail'])){
                        if(decodeInput($_SESSION[$this->formName]['cidm-email'])!=decodeInput($_SESSION['cidm-userEmail'])){
                            return 'no';
                        }
                        else {
                            return 'yes';
                        }
                    }
                    break;
                }
                default: {
                    $v = self::cidmCheck('qid');
                    if($v!='invalid') {
                        $v = self::cidmCheck('email');
                    }
                    return $v;
                    break;
                }
            }
        }
    }
    public function curlSubmit() {
//        $strCookie = isset($_COOKIE['PHPSESSID']) ?  'PHPSESSID=' . sanitizeInput($_COOKIE['PHPSESSID']) . '; path=/' : '';
//        $useragent = sanitizeInput($_SERVER['HTTP_USER_AGENT']);
        require_once ('config.php');
        foreach($_SESSION[$this->formName] as $k=>$p){
            $data[$k]=sanitizeInput(decodeInput($p));
        }


        $h = curl_init();
        curl_setopt($h, CURLOPT_URL, $this->formSubmitUrl);
        curl_setopt($h, CURLOPT_PROXY, $proxy);
        curl_setopt($h, CURLOPT_POST, true);
        curl_setopt($h, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($h, CURLOPT_HEADER, true);
        curl_setopt($h, CURLOPT_RETURNTRANSFER, true);
//        curl_setopt($h,CURLOPT_USERAGENT, $useragent);
//        curl_setopt( $h, CURLOPT_COOKIE, $strCookie );
        curl_setopt($h, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($h,CURLOPT_FAILONERROR,true);

        $result = curl_exec($h);

        $result_header_size = curl_getinfo($h, CURLINFO_HEADER_SIZE);
        $result_header = substr($result, 0, $result_header_size);
        $result_body = substr($result, $result_header_size);
        $httpCode = curl_getinfo($h, CURLINFO_HTTP_CODE);


        if(curl_errno($h)>0) {
            require_once ('notification.php');
            $to = "vani.ganapa@dsiti.qld.gov.au";
            $subject = "Form Submission Failure";
            $message = "Submission failed to :".$this->formSubmitUrl."\n";
            $message .= "Form Name :".$this->formName."\n";
            $message .= "Referer :".$this->formReferer."\n";
            $headers = "From :".$this->formReferer;
//            echo "<pre> Message :".$message."</pre>";
            new notifier($to, $subject, $message, $headers);
        }
        else if(preg_match('/Location: (.*)/',$result_header,$r)) {
            header('location: '.sanitizeInput(trim($r[1])));
            exit;
        }
        else {
//            echo "<pre><strong>BODY(".preg_match('/Location: (.*)/',$result_header).")</strong></pre>";
            echo $result_body;
        }
        curl_close($h);

    }

}
