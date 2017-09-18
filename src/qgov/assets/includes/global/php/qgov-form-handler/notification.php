<?php
class notifier
{
    function __construct($to, $subject, $message, $headers)
    {
        if(@mail($to, $subject, $message, $headers))
        {
            echo "Mail Sent Successfully";
        }else{
            echo "Mail Not Sent";
        }
    }
}
