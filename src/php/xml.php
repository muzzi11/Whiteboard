<?php
require 'database.php';

//wb_import_xml_from_file('../xml/cs50.tv.xml');

/**
Loads an xml file into a simplexml object.

Returns the object on success, FALSE on failure.
*/
function wb_load_xml_from_file($filename)
{   
    if( file_exists($filename) )
    {
        $xml = simplexml_load_file($filename);
        if($xml)
            return $xml;
        else
            $error = "Error: failed to load $filename";
    }
    else
        $error = "Error: file $filename does not exist.";

    echo $error;
    return FALSE;
}

/**
Loads an xml data string into a simplexml object.

Returns the object on success, FALSE on failure.
*/
function wb_load_xml_from_string($data)
{
    $xml = simplexml_load_string($data);
    if($xml)
        return $xml;
    else
        $error = "Error: failed to load $filename";
}

/**
title, description removen
*/
function wb_import_xml($xml)
{
    $con = wb_connect_database();
    if($con)
    {
        foreach($xml->folder as $section)
        {
            $title = '';
            $desc = '';
            
            $query = "INSERT INTO sitemap(parent_id, title, desc) VALUES()";
        }
    }
    echo '<pre>';
    foreach($xml->folder as $section)
    {
        echo $section->title . "\n";
        
        foreach($section->folder as $chapter)
        {
            echo "\t" . $chapter->title . "\n";
            echo $chapter->asXML() . "\n";
        }
    }
    echo '</pre>';
}

?>