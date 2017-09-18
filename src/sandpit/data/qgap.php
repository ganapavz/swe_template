<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en-AU" lang="en-AU">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<title>QGAP data demo | FRANCHISE | Queensland Government</title>

<!--#set var="franchise" value=""-->
<!--#set var="title" value="QGAP data demo"-->
<!--#set var="licence" value=""-->
<?php virtual("/assets/includes/global/head-assets.html") ?>


<!-- TODO map styles -->
<style type="text/css">
	#asides .map {

	}

	#map_canvas {
		width: 100%;
		height: 320px;
	}
</style>


	<meta name="description" content="DESCRIPTION" />
	<meta name="keywords" content="KEYWORDS" />

	<link rel="schema.DCTERMS" href="http://purl.org/dc/terms/" />
	<link rel="schema.AGLSTERMS" href="http://www.agls.gov.au/agls/terms/" />
	
	<meta name="DCTERMS.creator" scheme="AGLSTERMS.GOLD" content="c=AU; o=The State of Queensland; ou=DEPARTMENT NAME; ou=UNIT NAME" />
	<meta name="DCTERMS.publisher" scheme="AGLSTERMS.AglsAgent" content="corporateName=The State of Queensland; jurisdiction=Queensland" />
	<meta name="DCTERMS.created" content="2012-07-01" />
	<meta name="DCTERMS.modified" content="2012-07-01" />
	<meta name="DCTERMS.title" content="QGAP data demo | FRANCHISE" />
	<meta name="DCTERMS.description" content="DESCRIPTION" />
	<meta name="DCTERMS.subject" scheme="AGLSTERMS.APAIS" content="SUBJECT" />
	<meta name="AGLSTERMS.function" scheme="AGLSTERMS.AGIFT" content="FUNCTION" />
<?php virtual("/assets/includes/global/head-meta-identifier.html") ?>
	<meta name="DCTERMS.type" scheme="DCTERMS.DCMIType" content="Text" />
	<meta name="AGLSTERMS.documentType" scheme="AGLSTERMS.agls-document" content="guidelines" />
	<meta name="DCTERMS.audience" scheme="AGLSTERMS.agls-audience" content="" />
	<meta name="DCTERMS.jurisdiction" scheme="AGLSTERMS.AglsJuri" content="Queensland" />
	<meta name="DCTERMS.license" scheme="DCTERMS.URI" content="" />
</head>

<body id="qld-gov-au" class="residents">

<?php virtual("/assets/includes/global/header.html") ?>	
	
	<div id="page-container"><div class="max-width">
		<div id="breadcrumbs">
			<h2>You are here:</h2>
			<ol>
<?php virtual("/assets/includes/global/breadcrumb-citizen.html") ?>
				<li class="last-child">QGAP data demo</li>
			</ol>
		</div>
	
		<div id="content-container">
			<div id="content">
				<div class="article"><div class="box-sizing"><div class="border" id="article">
				
<?php virtual("/assets/includes/global/global-alert.html") ?>

					<h1>QGAP data demo</h1>

<?php virtual("/assets/includes/global/page-options-pre.html") ?>

					
					<div id="map_canvas">TODO STATIC MAP API</div>


<!-- process data in CSV -->
<?php


	// open CSV data (each line is one item in array)
	$lines = file( 'QGAP-sarina-data.csv' );

	// headers
	$headers = str_getcsv( array_shift( $lines ));
?>

					<table>
						<thead>
							<tr>
<?php
								echo '<th>QGAP</th>';
								echo '<th>Customer location</th>';
								echo '<th>Service</th>';
								echo '<th>Date</th>';
?>
							</tr>
						</thead>
						<tbody>
<?php

	// Loop through our array, show HTML source as HTML source; and line numbers too.
	foreach ( $lines as $line_num => $line ) {
		echo '<tr>';
			$data = str_getcsv( $line );
			echo '<td>' . htmlspecialchars( $data[ 0 ] ) . '</td>';
			echo '<td>' . htmlspecialchars( $data[ 1 ] ) . ' ' . htmlspecialchars( $data[ 2 ] ) . '</td>';
			echo '<td>' . htmlspecialchars( $data[ 3 ] ) . '</td>';
			echo '<td>' . htmlspecialchars( $data[ 4 ] ) . '</td>';
		echo '</tr>';

	}


?>
						</tbody>
					</table>
					
					
					
				</div></div></div><!-- end .article, .box-sizing, .border -->
			</div><!-- end #content -->

			<div id="asides"><div class="box-sizing"><div class="border">
				<?php virtual("/assets/includes/global/global-aside.html") ?>
				

				<div class="map aside">
					<h2>Map demo</h2>
				</div>
				
			
			</div></div></div><!-- end #asides, .box-sizing, .border -->

			<div id="meta-wrapper"><div class="meta-box-sizing"><div class="border">

				<div id="document-properties"><div class="box-sizing">
					<dl>
						<dt>Last updated</dt>
						<dd>1 July 2012</dd>
					</dl>
				</div></div>

<?php virtual("/assets/includes/global/page-options-post.html") ?>

			</div></div></div><!-- end #meta-wrapper, .meta-box-sizing, .border -->

		</div><!-- end #content-container -->
		
<?php virtual("/examples/nav/transport.html") ?>
	
	</div></div><!-- end #page-container, .max-width -->

<?php virtual("/assets/includes/global/footer.html") ?>
	

<script type="text/javascript">

var initMaps = function() {
		var myOptions = {
				zoom: 4,
				center: new google.maps.LatLng( -23, 143 ),
				mapTypeId: google.maps.MapTypeId.ROADMAP // ROADMAP, SATELLITE, HYBRID, TERRAIN
			},

			map = new google.maps.Map( document.getElementById( 'map_canvas' ), myOptions ),

			geocoder = new google.maps.Geocoder()
		;

		// add a marker for each location
		// TODO many of these addresses are duplicates (different centres at same address)
		// var letter = false;
		// $.each( $( 'tbody', '#content' ).find( 'tr' ), function( index, value ) {
			
		// 	var tr = $( this ),
		// 		td = tr.find( 'td' ),
		// 		name = td.eq( 0 ).text(),
		// 		data = {
		// 		'address': td.eq( 1 ).text() + ' ' + td.eq( 2 ),
		// 		'region' : 'AU'
		// 	};

			
		// 	// process one location per letter of the alphabet
		// 	// POC only, rate limiting on geocoding API
		// 	if ( letter === name.charAt( 0 )) {
		// 		return true;
		// 	} else {
		// 		letter = name.charAt( 0 );
		// 	}

		// 	// console.log( 'geocoding', data );

		// 	geocoder.geocode( data, function( results, status ) {
		// 		var marker;
		// 		if ( status === google.maps.GeocoderStatus.OK ) {
		// 			marker = new google.maps.Marker({
		// 				position: results[ 0 ].geometry.location,
		// 				title: td.eq( 0 ).text(),
		// 				visible: true,
		// 				animation: google.maps.Animation.DROP
		// 				// map: map
		// 			});
		// 			marker.setMap( map );
		// 		} else {
		// 			$.debug( 'Geocode was not successful for the following reason: ' + status );
		// 		}
		// 	});
		// });

	},

	// load googlemaps API
	loadMaps = function() {
		var script = document.createElement( 'script' );
		script.type = 'text/javascript';
		script.src = 'http://maps.googleapis.com/maps/api/js?sensor=false&callback=initMaps&region=AU';
		document.body.appendChild( script );
	}

;

$( loadMaps );
</script>


</body>
</html>
