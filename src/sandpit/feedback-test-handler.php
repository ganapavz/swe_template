<?php


if (trim($_POST['contact']) == 'fail') {
	
	// simulate failure
	header ('HTTP/1.1 500 Internal Server Error');
	echo '<p>An error occurred.</p>';
	
} else {
	
	// submission processed, now redirect
	header ('HTTP/1.1 303 See Other');
	header ('location: feedback-test-response.html');
	
}
?>