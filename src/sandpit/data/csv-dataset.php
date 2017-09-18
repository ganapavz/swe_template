<?php

	// get the dataset file token
	// TODO handle file encoding (UTF-8 expected? save as CSV from Excel does not use UTF-8?)
	$dataset = file( 'qgap-data.csv' );
	// TODO formats, filters, sorting ...

	$headers = str_getcsv( array_shift( $dataset ));
?>

<thead>
	<tr><?php

		// TODO configuration based on datatype based on heading label
		foreach ( $headers as $th ) {
			echo '<th class="' . htmlspecialchars( preg_replace( '/[^A-Za-z0-9]+/', '-', $th )) . '">' . htmlspecialchars( $th ) . '</th>';
		}

	?></tr>
</thead>
<tbody><?php
	
	foreach ( $dataset as $row ) {
		echo '<tr>';

		// TODO sorting, filtering
		$i = 0;
		foreach ( str_getcsv( $row ) as $td ) {
			echo '<td class="' . htmlspecialchars( preg_replace( '/[^A-Za-z0-9]+/', '-', $headers[ $i ] )) . '">' . htmlspecialchars( $td ) . '</td>';
			$i++;
		}

		echo '</tr>';
	}

?></tbody>
