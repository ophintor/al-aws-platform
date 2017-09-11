<?php
$dbconn = pg_connect("host=connectionstring port=5432 dbname=dbname user=user password=password")
    or die('Could not connect: ' . pg_last_error());
?>
