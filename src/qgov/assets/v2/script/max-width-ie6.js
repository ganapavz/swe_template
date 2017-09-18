/*global qg*/
(function( $, qg ) {
	'use strict';

	if ( qg.oldIE && qg.oldIEversion < 7 ) {
		var calcIE6MaxWidth = function() {
			
			if ( $( window ).width() > 1332 ) {
				$( 'html' ).addClass( 'ie6-max-width' ); // must be on html, 'cause body hasn't been parsed yet
			} else {
				$( 'html' ).removeClass( 'ie6-max-width' );
			}
			
		};
		$( window ).resize( calcIE6MaxWidth );
		
		
		// Do something straight away if a wide screen (to avoid flicker)
		if ( document.body ) { // $( window ).width() requires document.body for IE6!
			calcIE6MaxWidth();
		}
	}
	
	
}( jQuery, qg ));
