<?php

/**
Inserts a new user into the database if it doesn't exist yet.
Returns user_id on succes or if user already exists, false otherwise.
*/
function wb_insert_user($UvaNetID)
{
    require 'database.php';
    
    $con = wb_connect_database();
    if(!$con)
        return false;
    
    $UvaNetID = mysql_real_escape_string($UvaNetID);
    
    /*Behaviour of this query depends on mysql version and settings, auto_increment value might get increased even though
    no insertion takes place.
    $query = "INSERT INTO users(UvaNetID) VALUE('$UvaNetID') ON DUPLICATE KEY UPDATE user_id=LAST_INSERT_ID(user_id)";*/
    
    $user_id = false;
    //Check if user exists
    $result = wb_query("SELECT user_id FROM users WHERE UvaNetID=$UvaNetID LIMIT 1", $con);
    if($result && mysql_num_rows($result) == 1)
    {
        $row = mysql_fetch_array($result);
        $user_id = $row['user_id'];
    }
    //Insert new user
    else
    {
        if( wb_query("INSERT INTO users(UvaNetID) VALUE('$UvaNetID')") )
            $user_id = mysql_insert_id($con);
    }
    
    return $user_id;
}

?>