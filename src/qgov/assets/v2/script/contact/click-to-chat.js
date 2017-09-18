(function( $ ) {
	'use strict';
	
	// $.debug( 'Click to chat script loaded' );
	var firstError = true;

	// insert click-to-chat UI immediately after form
	var insertPoint = $( '.form', '#content' )
	// support missing #content on CHIIP template
	.add( '.form', '#content-container .article' )
	// take first match
	.eq( 0 );

	if ( insertPoint.length === 0 ) {
		// or last element in #content
		insertPoint = $( '.article > .box-sizing > .border > :last-child', '#content-container' );
	}

	insertPoint
	// insert click-to-chat code
	.after(
		'<div class="click-to-chat">' +
			// '<h2>Need help?</h2>' +
			'<div id="zldbtnframe"></div>' +
		'</div>'
	);

	// window.console.log( insertPoint );

	// highlight click-to-chat when form submit fails
	$( 'form' ).on( 'x-invalid', function() {
		if ( firstError ) {
			firstError = false;
		} else if ( $( this ).prev( '.click-to-chat' ).length === 0 ) {
			$( '.click-to-chat' ).clone().addClass( 'status info' ).insertBefore( this );
		}
	});


}( jQuery ));
