<?php
require 'database.php';

$xml = wb_load_xml_from_file('../../xml/cs50.tv.xml');
wb_import_xml($xml);

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
*/
function wb_import_xml($xml)
{
    $con = wb_connect_database();
    if(!$con)
        return;
        
    foreach($xml->folder as $section)
    {
        $parent_id = 0;
        $title = $section->title;
        
        $query = "INSERT INTO sitemap(parent_id, title) VALUES('$parent_id', '$title')";
        if( wb_query($query, $con) )
        {
            $parent_id = mysql_insert_id($con);
            
            foreach($section->folder as $chapter)
            {
                $title = $chapter->title;
                
                $query = "INSERT INTO sitemap(parent_id, title) VALUES('$parent_id', '$title')";
                if( wb_query($query, $con) )
                {
                    $page_id = mysql_insert_id($con);
                    
                    //Filter out title and description out of parent folder
                    {
                        $dom = dom_import_simplexml($chapter->title);
                        if($dom)
                            $dom->parentNode->removeChild($dom);
                        
                        $desc_elements = $chapter->xpath('desc');
                        if( count($desc_elements) > 0)
                        {
                            $desc = $desc_elements[0];
                            $dom = dom_import_simplexml($desc);
                            if($dom)
                                $dom->parentNode->removeChild($dom);
                        }
                    }
                    $data = $chapter->asXML();

                    //ERROR: fails silently, why?
                    $query = "INSERT INTO content(page_id, description, data) VALUES('$page_id', '$desc', x'$data')";
                }
            }
        }
    }
    
    mysql_close($con);
}

?>