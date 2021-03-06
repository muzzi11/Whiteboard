<?php

function wb_server_error()
{
	header('HTTP/1.1 500 Internal Server Error');
	die();
}

if( !isset($_GET['q']) )
	wb_server_error();


require 'database.php';

$con = wb_connect_database();
if(!$con)
	wb_server_error();


$q = $_GET['q'];
/**
Usage: /query.php?q=sitemap

Retrieves the sitemap from the database and echos a json encoded associative array. Structure:
array( 'title' => , 'children' => array ( 'page_id' => , 'title' =>) )
*/
if( 'sitemap' == $q)
{       
	$result = mysql_query('SELECT * FROM sitemap', $con);
	if(!$result)
		wb_server_error();
	
	$pages = array();
	while( $row = mysql_fetch_array($result) )
	{
        if($row['active'])
        {
            $pages[] = array( 'page_id' => $row['page_id'],
								'parent_id' => $row['parent_id'],
								'title' => $row['title'] );
        }
	}
	
	$sitemap = array();
	foreach($pages as $i)
	{
		if($i['parent_id'] != 0)
				continue;
		
		$children = array();
		foreach($pages as $k)
		{
				if($k['parent_id'] == $i['page_id'])
				{
					$children[] = array( 'page_id' => $k['page_id'],
												'title' => $k['title'] );
				}
		}
		
		$sitemap[] = array( 'title' => $i['title'],
									'children' => $children );
	}
	
	echo json_encode($sitemap);
}
/**
Usage: /query.php?q=content&page=[page_id]

Retrieves the description and data from the content table for the page_id specified in $_GET['page'].
Echos a json encoded associative array with the following structure:
array( 'desc' => , 'data' => )
*/
else if('content' == $q)
{
	if( !isset($_GET['page']) )
		wb_server_error();
		
	$page_id = mysql_real_escape_string( $_GET['page'] );
	
	$query = "SELECT description, data FROM content WHERE page_id='$page_id' LIMIT 1";
	$result = mysql_query($query, $con);
	if(!$result || mysql_num_rows($result) == 0)
		wb_server_error();
		
	$row = mysql_fetch_array($result);
	$content = array( 'desc' => $row['description'], 'data' => $row['data'] );
	
	echo json_encode($content);
}
/**
* Post/Delete/Edit and/or Retrieve comments. page_id is always required.
* Usage: query?q=comments&page=page_id&[&del=comment_id][&post="text"[&parent=parent][&edit=comment_id]]
*/
else if('comments' == $q)
{
	session_start();
    
    if( isset($_SESSION['user_id']) )
	   $user_id = $_SESSION['user_id'];
    else
        die();

	if( !isset($_GET['page']) )
		wb_server_error();
		
	$page_id = mysql_real_escape_string( $_GET['page'] );


	if (isset($_GET['del'])) {
		
		$comment_id = mysql_escape_string($_GET['del']);
		$query = "DELETE FROM comments
					WHERE comment_id='$comment_id'";
        if( !isset($_SESSION['teacher']) )
            $query .= " AND user_id='$user_id'";
		wb_query($query, $con);
	}
	else if(isset($_GET['post'])) {

		$post = strip_tags($_GET['post']);
		$post = mysql_real_escape_string( $post );
		
		if(isset($_GET['edit']))
		{
			$comment_id = mysql_real_escape_string($_GET['edit']);
			$query = "UPDATE comments
						SET comment='$post', datetime=NOW()
						WHERE comment_id='$comment_id' AND user_id='$user_id'";
		}
		else {

			$parent = isset($_GET['parent']) ? mysql_real_escape_string( $_GET['parent'] ) : '0';
			$query = "INSERT INTO comments (comment, datetime, user_id, page_id, reply_ref) 
			VALUES ('$post', NOW(),'$user_id', '$page_id', '$parent')";
		}
		wb_query($query, $con);
	}
		
	
	$query =  "SELECT comment_id, comment, user_id, datetime, reply_ref
					FROM comments
					WHERE page_id='$page_id'";
	$result = mysql_query($query, $con);
	if(!$result)
		wb_server_error();
	
	//We will assume that no comments is a valid posibility.
	if(mysql_num_rows($result) != 0) {
		
		while($row = mysql_fetch_array($result)) {
			$content[] = array( 'id' => $row['comment_id'],
							'text' => $row['comment'],
							'user' => $row['user_id'],
							'date' => $row['datetime'],
							'parent' => $row['reply_ref']);
		}
		echo json_encode($content);
	}
}
/**
* Return UvaNetID when the user is logged in, otherwise return false.
*/
else if ( $q ='user' ) {
    session_start();
    
	if(isset($_SESSION['UvaNetID']))
        echo $_SESSION['UvaNetID'];
    else
        echo '';
}

else
	wb_server_error();

?>