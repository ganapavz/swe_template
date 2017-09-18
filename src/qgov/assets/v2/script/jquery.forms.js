(function( $ ){
	'use strict';


	/* detect required field markers for IE6 */
	$( 'abbr[title*="required"]' ).addClass( 'required' );


	// show/hide entire 'question' when fields become irrelevant
	$( '.questions > li' ).not( '.section' )
		.bind( 'relevant', function( event ) {
			$( this ).relevance( 'show' );
			event.stopImmediatePropagation();
		})
		.bind( 'irrelevant', function( event ) {
			$( this ).relevance( 'hide' );
			event.stopImmediatePropagation();
		})
	;


	// click the table cell to click on a matrix option
	$( '.matrix' ).delegate( 'td', 'click', function( evt ) {
		$( evt.target )
			.find( 'input' )
				.trigger( 'click' )
				.trigger( 'change' )
		;
	});

}( jQuery ));
