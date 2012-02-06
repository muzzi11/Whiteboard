<?php

/**
MySQL query wrapper for error logging purposes.
*/
function wb_query($query, $con)
{
	$resource = mysql_query($query, $con);
	if(!$resource)
		echo 'Invalid query: ' . mysql_error() . "\nQuery: $query\n";
		
	return $resource;
}

/**
Connects and selects the database specified in db-config.
db-config.php should contain the database name, username and password: $db_name, $username and $password

Returns the connection resource link identifier.

NOTE: on database selection failure calls wb_create_database(), should be taken out in production setting
*/
function wb_connect_database()
{
	require 'db-config.php';
	if( !defined('USERNAME') || !defined('PASSWORD') || !defined('DB_NAME') )
		die('Database config constants are not properly defined.');
	
	$con = mysql_connect('localhost', USERNAME, PASSWORD);
	if($con)
	{
		if( !mysql_select_db(DB_NAME, $con) )
		      wb_create_database(DB_NAME, $con);
              
        //for websec purposes
        wb_create_database(DB_NAME, $con);
	}
	else
	{
		echo 'Could not connect: ' . mysql_error();
		return FALSE;
	}
	
	if( !mysql_set_charset('utf8', $con) )
		echo 'Failed to set character set, current set is:' . mysql_client_encoding($con);
		
	return $con;
}

/**
Creates the database and all it's tables on the localhost.
*/
function wb_create_database($db_name, $con)
{        
	if( !mysql_query("CREATE DATABASE IF NOT EXISTS $db_name", $con) )
		die( 'Could not create database: ' . mysql_error() );
	if( !mysql_select_db($db_name, $con) )
		die( 'Could not select database: ' . mysql_error() );
	
	wb_create_sitemap_table($con);
	wb_create_content_table($con);
	wb_create_users_table($con);
	wb_create_permissions_table($con);
	wb_create_comments_table($con);
}

/**
Creates the sitemap table if it doesn't exist yet.
*/
function wb_create_sitemap_table($con)
{
	$query = 'CREATE TABLE IF NOT EXISTS sitemap
	(
		page_id INT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE,
		PRIMARY KEY(page_id),
		parent_id INT UNSIGNED,
		active BOOL NOT NULL DEFAULT 1,
		title VARCHAR(100)
	) ENGINE=InnoDB';
	
	wb_query($query, $con);
}

/**
Creates the content table.

NOTE: not sure if data should be of type MEDIUMBLOB
*/
function wb_create_content_table($con)
{
	$query = 'CREATE TABLE IF NOT EXISTS content
	(
		content_id INT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE,
		PRIMARY KEY(content_id),
		page_id INT UNSIGNED NOT NULL,
		FOREIGN KEY(page_id) REFERENCES sitemap(page_id),
		description TEXT,
		data MEDIUMBLOB
	) ENGINE=InnoDB';
	
	wb_query($query, $con);
}

/**
Creates the users table if it doesn't exist yet.
UvaNetID can't be null and must be unique.

NOTE: name is allowed to be null, might have to change that.
*/
function wb_create_users_table($con)
{
	$query = 'CREATE TABLE IF NOT EXISTS users
	(
		user_id SERIAL,
		PRIMARY KEY(user_id),
		UvaNetID VARCHAR(50) NOT NULL UNIQUE,
		name VARCHAR(50)
	) ENGINE=InnoDB';
	
	wb_query($query, $con);
}

/**
Creates the permissions table if it doesn't exist yet.
Could be optimized a little by making user_id a SERIAL PRIMAL KEY,
application would have to handle relation with the users table.
*/
function wb_create_permissions_table($con)
{
	$query = 'CREATE TABLE IF NOT EXISTS permissions
	(
		permission_id SERIAL,
		PRIMARY KEY(permission_id),
		user_id BIGINT UNSIGNED NOT NULL,
		FOREIGN KEY(user_id) REFERENCES users(user_id),
		view BOOL NOT NULL DEFAULT 1,
		edit BOOL NOT NULL DEFAULT 1,
		del BOOL NOT NULL DEFAULT 0,
		admin BOOL NOT NULL DEFAULT 0
	) ENGINE=InnoDB';
	
	wb_query($query, $con);
}

/**
Creates the comments table if it doesn't exist yet.
*/
function wb_create_comments_table($con)
{
	$query = 'CREATE TABLE IF NOT EXISTS comments
	(
		comment_id SERIAL,
		PRIMARY KEY(comment_id),
		user_id BIGINT UNSIGNED NOT NULL,
		FOREIGN KEY(user_id) REFERENCES users(user_id),
		page_id INT UNSIGNED NOT NULL,
        FOREIGN KEY(page_id) REFERENCES sitemap(page_id),
		datetime DATETIME,
		comment TEXT,
		reply_ref BIGINT UNSIGNED NOT NULL DEFAULT 0
	) ENGINE=InnoDB';
	
	wb_query($query, $con);
}

?>