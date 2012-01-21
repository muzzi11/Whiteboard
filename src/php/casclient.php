<?php

/**
Usage: casclient?login
Redirects the user to the CAS login page.
*/
if( isset($_GET['login']) )
{
    $host = urlencode('http://' . $_SERVER['SERVER_NAME'] . $_SERVER['REDIRECT_URL']);
    $redirect = "https://bt-lap.ic.uva.nl/cas/login?service=$host";
    header("Location: $redirect");
}

/**
Proceeds to validate ticket.
*/
if( isset($_GET['ticket']) )
    wb_verify_ticket($_GET['ticket']);

/**
Validates the ticket trough CAS.
*/
function wb_verify_ticket($ticket)
{
    $host = urlencode('http://' . $_SERVER['SERVER_NAME'] . $_SERVER['REDIRECT_URL']);
    
    $ch = curl_init();
 
    curl_setopt($ch, CURLOPT_URL, "https://bt-lap.ic.uva.nl/cas/serviceValidate?ticket=$ticket&service=$host");
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
    
    $result = curl_exec($ch);
    curl_close($ch);
    
    {
        $result = str_replace('cas:', '', $result);
        
        $xml = simplexml_load_string($result);
        $json = json_encode($xml);
        $array = json_decode($json, true);
        
        if( is_array($array) && array_key_exists('authenticationSuccess', $array) )
        {
            if( is_array($array) && array_key_exists('user', $array['authenticationSuccess']) )
            {
                echo $array['authenticationSuccess']['user'];
            }
        }
        else
            print_r($array);
    }
}

?>