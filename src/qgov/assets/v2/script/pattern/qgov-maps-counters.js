/*global jQuery,google,MarkerClusterer,qg*/

// global callback
var initMaps, info;


// closure
(function( $ ) {
	'use strict';

	var addDataToMap,
		jsonData, map, markerClusterer,
		mapReady = false,
		dataReady = false,
		dataset
	;


	// add data to the map
	addDataToMap = function() {
		var i = 0,
			markers = {},
			zoomRadius = ( jsonData.location.length === 2 ? 5 : 0 ),

			addMarkerLink = function( list, title ) {
				var a = $( '<a href="view/?title=' + encodeURIComponent( title ) + '"></a>' );
				a.text( title );
				a.wrap( '<li/>' ).parent().appendTo( list );

				return list;
			}
		;

		// do we have a location?
		if ( zoomRadius ) {
			map.setCenter( new google.maps.LatLng( jsonData.location[ 0 ], jsonData.location[ 1 ] ));
		}

		// loop through counters
		$.each( jsonData.matches, function( key, counter ) {
			var latlong = counter.Latitude + ',' + counter.Longitude,
				marker;

			// put it on the map?
			if ( ! counter.Latitude ) {
				return;
			}
			if ( markers[ latlong ] ) {
				// already have a marker at this position
				// make the info popup list all counters at this marker?
				addMarkerLink( markers[ latlong ], counter.Title );
				return;
			} else {
				// track it
				markers[ latlong ] = addMarkerLink( $( '<ul></ul>' ), counter.Title );
			}

			// zoom to the 2 nearest counters
			if ( zoomRadius && counter.Distance > zoomRadius ) {
				if ( i > 1 ) {
					// zoom to markers
					markerClusterer.fitMapToMarkers();
					// centre the map on the search location (may hide some markers, but matches user intent)
					map.panTo( new google.maps.LatLng( jsonData.location[ 0 ], jsonData.location[ 1 ] ));
					// flag to stop checking radius/distance
					zoomRadius = 0;
				} else {
					// increase the radius
					zoomRadius = counter.Distance + 10.0;
				}
			}

			marker = new google.maps.Marker({
				position: new google.maps.LatLng( counter.Latitude, counter.Longitude ),
				title: counter.Title,
				visible: true,
				animation: google.maps.Animation.DROP,
				map: map
			});

			// marker click, show info box
			google.maps.event.addListener( marker, 'click', function() {
				// info box already visible?
				if ( info ) {
					info.close();
				}

				info = new google.maps.InfoWindow({ content: markers[ latlong ].get( 0 ) });
				info.open( map, marker );
			});

			markerClusterer.addMarker( marker );

			i++; // count it

		});
	};


	// initialise map with data
	initMaps = function() {
		var mapResize = function() {
				google.maps.event.trigger( map, 'resize' );
			},
			myOptions = {
				zoom: 5,
				center: new google.maps.LatLng( -23, 143 ), // Qld = -23, 143?
				mapTypeId: google.maps.MapTypeId.ROADMAP // ROADMAP, SATELLITE, HYBRID, TERRAIN
			}
		;

		$( 'form', '#content' ).eq( 0 ).before( '<div id="canvas"></div>' );
		$( '#canvas' ).append( '<div id="map_canvas"></div>' );

		map = new google.maps.Map( document.getElementById( 'map_canvas' ), myOptions );
		markerClusterer = new MarkerClusterer( map, null, {
			imagePath: qg.swe.paths.assets + 'images/skin/map-marker/m',
			imageSizes: [ 53, 56, 66, 78, 90 ],
			imageExtension: 'png'
		});

		if ( dataReady ) {
			addDataToMap();
		}
		mapReady = true;

		// handle resizing
		window.ResizeEvents.bind( 'x-window-width-resize', mapResize );

		// lightbox
		$( '#canvas' ).after( '<a id="butterfly-map" href="#canvas">View fullscreen</a>' );
		$( '#butterfly-map' ).butterfly({
			contentDefaultWidth: '90%',
			contentDefaultHeight: '90%',
			reuseFragment: true,
			callbackPostResize: mapResize,
			callbackPostOpen: mapResize,
			callbackPostClose: mapResize
		});
	};


	// load json data
	dataset = $( 'ol.counters' )[ 0 ].className.replace( /\s*counters\s*/, '' );
	$.getJSON( '/assets/includes/dynamic/counters/json.php?dataset=' + encodeURIComponent( dataset ) + window.location.search.replace( /^\?/, '&' ), function( data ) {
		jsonData = data;

		if ( mapReady ) {
			addDataToMap();
		}
		dataReady = true;
	});


}( jQuery ));
