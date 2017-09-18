// globals
var qg = qg || {};
qg.swe = qg.swe || {};
qg.swe.pageModel = qg.swe.pageModel || {};

(function( $, swe ) {
	'use strict';


	var highlightIaLinks = function( links ) {
			var highlight;

			if ( ! swe.isMobile ) {
				return false;
			}

			links = $( 'a', '#ia' ).filter(function() {
				return $.inArray( $( this ).text(), links ) >= 0;
			});

			if ( links.length > 0 ) {
				highlight = $( '.highlight', '#ia' );
				if ( highlight.length === 0 ) {
					highlight = $( '<ul class="highlight"/>' ).prependTo( '#ia' );
				}
				
				links.clone().wrap( '<li/>' ).parent().prependTo( highlight );

				// display IA when more button clicked
				$( '#ia' ).delegate( 'button', 'click', function() {
					// undo flex grid heights
					$( '#ia li' ).css({ height: 'auto' });
					$( '#ia > ul' ).slideDown();
					$( '#ia > button' ).remove();
				});

				$( '#ia > ul' ).not( highlight )
					.after( '<button>More…</button>' )
					.hide()
				;
			}
		}
	;


	swe.pageModel.iaHighlight = highlightIaLinks;


}( jQuery, qg.swe ));