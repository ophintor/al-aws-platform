<?php
	$task = strip_tags( $_POST['task'] );
	$date = date("Y-m-d");
	$time = date("h:i:sa");

	require("connect.php");

	pg_query("INSERT INTO tasks (task, taskdate, tasktime) VALUES ('$task', '$date', '$time')");

	$query = pg_query("SELECT * FROM tasks WHERE task='$task' and taskdate='$date' and tasktime='$time'");

	while( $row = pg_fetch_assoc($query) ){
		$task_id = $row['id'];
		$task_name = $row['task'];
	}

	pg_close();

	echo '<li><span>'.$task_name.'</span><img id="'.$task_id.'" class="delete-button" width="10px" src="images/close.svg" /></li>';
  header("Refresh:0");
?>
