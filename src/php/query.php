<?php

function server_error()
{
    header('HTTP/1.1 500 Internal Server Error');
    die();
}

if( !isset($_GET['q']) )
    server_error();


require 'database.php';

$q = $_GET['q'];

/**
Retrieves the sitemap from the database and echos a json encoded associative array. Structure:
array( 'title' => , 'children' => array ( 'page_id' => , 'title' =>) )
*/
if( 'sitemap' == $q)
{
    $con = wb_connect_database();
    if(!$con)
        server_error();
        
    $result = mysql_query('SELECT * FROM sitemap', $con);
    if(!$result)
        server_error();
    
    $pages = array();
    while( $row = mysql_fetch_array($result) )
    {
        $pages[] = array( 'page_id' => $row['page_id'],
                          'parent_id' => $row['parent_id'],
                          'title' => $row['title'] );
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
else
    server_error();

?>