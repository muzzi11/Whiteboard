<?php

if( !isset($_GET['dbname']) )
    die();

wb_create_database( $_GET['dbname'] );

/**
Creates the database and all it's tables on the localhost.
Requires db-config.php which should contain the database username and password: $username and $password
*/
function wb_create_database($db_name)
{
    require 'db-config.php';
    if( !isset($username) || !isset($password) )
        die('Login variables are not set.');
    
    $con = mysql_connect('localhost', $username, $password);
    {
        if( !$con )
            die( 'Could not connect: ' . mysql_error() );
        
        if( !mysql_query("CREATE DATABASE IF NOT EXISTS $db_name", $con) )
            die( 'Could not create databse: ' . mysql_error() );
        if( !mysql_select_db($db_name, $con) )
            die( 'Could not select database: ' . mysql_error() );
        
        wb_create_sitemap_table($con);
        wb_create_content_table($con);
        wb_create_users_table($con);
        wb_create_permissions_table($con);
        wb_create_last_pages_table($con);
        wb_create_comments_table($con);
    }
}

/**
Creates the sitemap table if it doesn't exist yet.
*/
function wb_create_sitemap_table($con)
{
    $query = "CREATE TABLE IF NOT EXISTS sitemap
    (
        page_id INT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE,
        PRIMARY KEY(page_id),
        parent_id INT UNSIGNED,
        title VARCHAR(50)
    )";
    
    if( !mysql_query($query, $con) )
        echo 'Invalid query: ' . mysql_error() . "\nQuery: $query";
}

/**
Creates the content table.

NOTE: not sure if data should be of type MEDIUMBLOB
*/
function wb_create_content_table($con)
{
    $query = "CREATE TABLE IF NOT EXISTS content
    (
        content_id INT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE,
        PRIMARY KEY(content_id),
        page_id INT UNSIGNED NOT NULL,
        FOREIGN KEY(page_id) REFERENCES sitemap(page_id),
        active BIT,
        data MEDIUMBLOB
    )";
    
    if( !mysql_query($query, $con) )
        echo 'Invalid query: ' . mysql_error() . "\nQuery: $query";
}

/**
Creates the users table if it doesn't exist yet.
UvaNetID can't be null and must be unique.

NOTE: name is allowed to be null, might have to change that.
*/
function wb_create_users_table($con)
{
    $query = "CREATE TABLE IF NOT EXISTS users
    (
        user_id SERIAL,
        PRIMARY KEY(user_id),
        UvaNetID VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(50)
    )";
    
    if( !mysql_query($query, $con) )
        echo 'Invalid query: ' . mysql_error() . "\nQuery: $query";
}

/**
Creates the permissions table if it doesn't exist yet.
Could be optimized a little by making user_id a SERIAL PRIMAL KEY,
application would have to handle relation with the users table.
*/
function wb_create_permissions_table($con)
{
    $query = "CREATE TABLE IF NOT EXISTS permissions
    (
        user_id BIGINT UNSIGNED NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(user_id),
        view BOOL,
        edit BOOL,
        del BOOL,
        admin BOOL
    )";
    
    if( !mysql_query($query, $con) )
        echo 'Invalid query: ' . mysql_error() . "\nQuery: $query";
}

/**
Creates the last_pages table if it doesn't exist yet.
last_pages is a serialized array of page_ids and corresponding parent page ids: [parent id][page id]
*/
function wb_create_last_pages_table($con)
{
    $query = "CREATE TABLE IF NOT EXISTS last_pages
    (
        user_id BIGINT UNSIGNED NOT NULL UNIQUE,
        FOREIGN KEY(user_id) REFERENCES users(user_id),
        ser_last_pages BLOB
    )";
    
    if( !mysql_query($query, $con) )
        echo 'Invalid query: ' . mysql_error() . "\nQuery: $query";
}

/**
Creates the comments table if it doesn't exist yet.
*/
function wb_create_comments_table($con)
{
    $query = "CREATE TABLE IF NOT EXISTS comments
    (
        comment_id SERIAL,
        PRIMARY KEY(comment_id),
        user_id BIGINT UNSIGNED NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(user_id),
        page_id INT UNSIGNED NOT NULL,
        datetime DATETIME,
        comment TEXT
    )";
    
    if( !mysql_query($query, $con) )
        echo 'Invalid query: ' . mysql_error() . "\nQuery: $query";
}

?>