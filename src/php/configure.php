<!DOCTYPE html>
<html>
<head>
<title>Configuration</title>

<script language="JavaScript" type="text/javascript">
	function validate_form(form)
	{
		for(var i = 0; i < form.elements.length; i++)
		{
				if(form.elements[i].value == '')
				{
					if(form.elements[i].name != 'XML')
					{
						alert("You haven't filled in the required fields.");
						form.elements[i].focus();
						return false;
					}
					else
						confirm('Do you wish to proceed without importing an XML file into the database?');
				}
		}
	}
</script>
</head>

<body>
	<?php
	if( isset($_POST['db_name']) && isset($_POST['username']) && isset($_POST['password']) )
	{
		$file = fopen('db-config.php', 'w');
		if($file)
		{
				$config = "<?php define('DB_NAME', '"  . $_POST['db_name'] . "'); " .
									"define('USERNAME', '" . $_POST['username'] . "'); " .
									"define('PASSWORD', '" . $_POST['password'] . "'); ?>";
				if( fwrite($file, $config) )
					echo 'Config file creation succeeded.<br />';
				else
					echo 'Error: config file creation failed.<br />';

				fclose($file);
		}
		
		if( isset($_POST['XML']) && $_POST['XML'] != '')
		{
				require 'xml.php';
				if( wb_import_xml_from_url($_POST['XML']) )
					echo 'XML import succeeded.';
		}
	}
	else
	{ ?>
		<form action="" method="POST" onsubmit="return validate_form(this);">
				Database name*:<input type="text" name="db_name" /><br />
				Database username*:<input type="text" name="username" /><br />
				Database password*:<input type="password" name="password" /><br />
				<br />
				XML import link:<input type="text" name="XML" size="92" /><br />
				<br />
				<input type="submit" value="Submit" />
		</form>  
	<?php
	}
	?>
</body>
</html>