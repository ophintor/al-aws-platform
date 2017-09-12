<?php
	$task_id = strip_tags( $_POST['task_id'] );

	require("connect.php");

	pg_query("DELETE FROM tasks WHERE id='$task_id'");
	header("Refresh:0");
?>
