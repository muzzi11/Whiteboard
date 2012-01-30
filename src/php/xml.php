<?php
require 'database.php';

if( isset($_GET['cmd']) )
{
    if('import' == $_GET['cmd'])
    {
        $xml = wb_load_xml_from_file('../../xml/cs50.tv.xml');
        wb_import_xml($xml);
    }
}

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
    return false;
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
        echo 'Error: failed to load xml string.';
        
    return false;
}


/**
Retrieves and imports xml data from the specified url.
Returns true on succes, false otherwise.
*/
function wb_import_xml_from_url($url)
{
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
    
    $data = curl_exec($ch);
    curl_close($ch);
    
    if($data)
    {
        if( $xml = wb_load_xml_from_string($data) )
        {
            wb_import_xml($xml);
            return true;
        }
    }
    else
        echo "Could not retrieve XML data from: $url";
        
    return false;
}

/**
Imports the $xml object into the database. The root folders are considered sections, the folder one level below are considered chapters.
The section and chapter titles and the chapter description are imported into the sitemap table.
Chapter title and description elements are taken out of the xml, the resting xml for that chapter is imported into the content table. 
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
                    $desc = '';
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
                    $data = mysql_real_escape_string($data, $con);
                    $desc = mysql_real_escape_string($desc, $con);

                    $query = "INSERT INTO content(page_id, description, data) VALUES('$page_id', '$desc', '$data')";
                    wb_query($query, $con);
                }
            }
        }
    }
    
    mysql_close($con);
}

?>