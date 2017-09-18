<?php

	// get the dataset file token
	// TODO handle file encoding (UTF-8 expected? save as CSV from Excel does not use UTF-8?)
	$dataset = file( 'QGAP-sarina-data.csv' );
	// TODO formats, filters, sorting ...

	$headers = str_getcsv( array_shift( $dataset ));
?>

<thead>
	<tr>
		<th>QGAP</th>
		<th colspan="2">Customer locality</th>
		<th>Service</th>
		<th>Timestamp</th>
	</tr>
</thead>
<tbody><?php
	
	foreach ( $dataset as $row ) {
		echo '<tr>';

		// TODO sorting, filtering
		$i = 0;
		foreach ( str_getcsv( $row ) as $td ) {
			echo '<td>' . htmlspecialchars( $td ) . '</td>';
			$i++;
		}

		echo '</tr>';
	}

?></tbody>
