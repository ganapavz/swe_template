/*globals ResizeEvents*/
(function( $, ResizeEvents ) {
	'use strict';


	// manage scrolling on wide content
	var scrollable = function() {
		// NOTE: this timeout fixes a bug with the width() values returned in IE8
		// http://stackoverflow.com/a/10170769
		setTimeout(function() {
			$( 'table' ).not( '.horizontal table' ).each(function() {
				var table = $( this ),
				    isScrollable = table.parent().parent().hasClass( 'scrollable' )
				;

				if ( table.outerWidth( true ) > table.parent().width() ) {
					if ( ! isScrollable ) {
						table.wrap( '<div class="scrollable"/> ').wrap( '<div class="inner"/>' );
					}
				} else {
					if ( isScrollable ) {
						// remove div.scrollable > div.inner wrappers
						table.unwrap().unwrap();
					}
				}
			});
		}, 0 );
	};

	// initialise dom ready, load and resize
	$( document ).bind( 'ready load', scrollable );
	ResizeEvents.bind( 'x-window-width-resize', scrollable );


}( jQuery, ResizeEvents ));
