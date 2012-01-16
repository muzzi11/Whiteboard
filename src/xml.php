<?php

import_xml('../xml/cs50.tv.xml');

function import_xml($filename)
{
    if( file_exists($filename) )
    {
        $xml = simplexml_load_file($filename);
        
        echo '<pre>';
        print_r($xml);
        echo '</pre>';
    }
    else
        echo "Error: file $filename does not exist.";
}

?>