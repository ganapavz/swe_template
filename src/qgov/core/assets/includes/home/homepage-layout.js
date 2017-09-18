/*global qg, ResizeEvents*/
(function( $, ResizeEvents ) { /* start closure */
	'use strict';


	var oldColumns = 0;

	// adaptable layout
	var layoutManager = function() {
		var body = $( document.body ),
			columns = $( '#header' ).offset().left === $( '.max-width', '#header' ).eq( 0 ).offset().left ? 1 : 3
		;

		// did columns change?
		if ( columns === oldColumns ) {
			// no change, get out of here
			return;
		} else {
			// track and continue
			oldColumns = columns;
		}

		// single column
		if ( columns === 1 ) {
			// place announcements before features
			$( '#news' ).insertBefore( '#featured' );
			// hide the images
			$( 'img', '#news .viewport' ).css( 'display', 'none' );
			// make it visible
			$( '.contents', '#news' ).show( 0 );

		} else {
			// show the images
			$( 'img', '#news .viewport' ).css( 'display', 'block' );
			// place announcements in normal flow
			$( '#news' ).prependTo( '#asides-primary' );

		}
	};


	// on width change
	ResizeEvents.bind( 'x-initial-sizes x-window-width-resize', layoutManager );


}( jQuery, ResizeEvents )); /* end closure */
