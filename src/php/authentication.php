<?php

session_start();

$host = 'http://' . $_SERVER['SERVER_NAME'];
if( isset($_SERVER['REDIRECT_URL']) )
   $host .= $_SERVER['REDIRECT_URL'];
else
    $host .= '/webdb1230/whiteboard/src/php/authentication.php';
$host = urlencode($host);

/**
Usage: authentication?login&service=[url encoded relative path]
Redirects the user to the CAS login page.
Stores service in the session, upon ticket retrieval the user is redirected to this service.
*/
if( isset($_GET['login']) )
{
	if( isset($_GET['service']) )
		$_SESSION['service'] = isset($_SERVER['REDIRECT_URL']) ? $_GET['service'] : 'http://websec.science.uva.nl/webdb1230/';
    
	$redirect = "https://bt-lap.ic.uva.nl/cas/login?service=$host";
	header("Location: $redirect");
}

/**
Usage: authentication?logout
Redirects the user to the CAS logout page and destroys session data.
*/
if( isset($_GET['logout']) )
{
	session_destroy();
	$redirect = "https://bt-lap.ic.uva.nl/cas/logout";
	header("Location: $redirect");
}

/**
Proceeds to validate ticket. If ticket is valid, user is inserted into database and user_id is stored in session.
*/
if( isset($_GET['ticket']) )
{
	require 'user.php';
	
	if ( $UvaNetID = wb_verify_ticket($_GET['ticket']) )
	{
		if( $user_id = wb_insert_user($UvaNetID) )
        {
            $_SESSION['user_id'] = $user_id;
            $_SESSION['UvaNetID'] = $UvaNetID;
            
            if( wb_is_teacher($UvaNetID) )
                $_SESSION['teacher'] = true;
        }
	}
	
	if( isset($_SESSION['service']) )
		header('Location: ' . $_SESSION['service']);
}

/**
Validates the ticket trough CAS.
Returns the UvaNetID on succes, false otherwise.
*/
function wb_verify_ticket($ticket)
{	
	$ch = curl_init();

	curl_setopt($ch, CURLOPT_URL, "https://bt-lap.ic.uva.nl/cas/serviceValidate?ticket=$ticket&service=$host");
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
	curl_setopt($ch, CURLOPT_HEADER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
	
	$result = curl_exec($ch);
	curl_close($ch);
	
	if($result)
	{
		$result = str_replace('cas:', '', $result);
		
		$xml = simplexml_load_string($result);
		$json = json_encode($xml);
		$array = json_decode($json, true);
		
		if( is_array($array) && array_key_exists('authenticationSuccess', $array) )
		{
				if( is_array($array) && array_key_exists('user', $array['authenticationSuccess']) )
					return $array['authenticationSuccess']['user'];
		}
	}
	
	return false;
}

?>