(function( $ ){
	'use strict';


	// find any textareas with a word count
	$( '.hint' ).filter(function() {
		return ( /Maximum:\s+\d+\s+words/ ).test( $( this ).text() );
	}).each(function() {
		var hint = $( this ),
		    max = parseInt( hint.text().replace( /Maximum:\s+(\d+)\s+words/, '$1' ), 10 ),
		    textField = hint.closest( 'label' ).nextAll( 'textarea' ),
		    counter
		;

		// add counter
		counter = $( '<span/>' ).generateId( 'word-count' );
		//eg. Maximum: 50 words (50 remaining)
		hint.append( ' (', counter, ' remaining)' );

		textField.simplyCountable({
			counter: '#' + counter[ 0 ].id,
			countType: 'words',
			countDirection: 'down',
			maxCount: max,
			onOverCount: function() {
				textField[ 0 ].setCustomValidity( 'Too many words' );
			},
			onSafeCount: function() {
				textField[ 0 ].setCustomValidity( '' );
			}
		});
	});


}( jQuery ));
