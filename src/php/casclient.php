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
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
    
    $result = curl_exec($ch);
    curl_close($ch);
    
    $result = str_replace(':', '-', $result);
    $xml = simplexml_load_string($result);
    
    if($xml)
    {
        if( $user = wb_find_user($xml) )
        {
            $replace = array("\n", ' ');
            echo str_replace($replace, '', $user);
        }
    }
    else
        echo 'Failed to load xml.';
}

function wb_find_user($element)
{
    if( $element->count() )
    {
        foreach($element->children() as $child)
        {
            if( wb_find_user($child) )
                return $child;
        }
    }
    return $element->getName() == 'cas-user' ? $element : FALSE;
}

?>