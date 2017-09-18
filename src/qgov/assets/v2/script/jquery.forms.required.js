(function( $ ){
	'use strict';


	// extend jquery to 'toggle required'
	$.fn.toggleRequired = function( required ) {
		return this.each(function() {

			var controls = $( this.form.elements[ this.name ] ),
				question = $( this ).closest( '.questions > li' )
			;

			if ( required ) {
				if ( question.find( 'abbr[title="(required)"]' ).length === 0 ) {
					question.find( '.label' ).after(
						// create ABBR shiv for IE6 
						$( document.createElement( 'abbr' ))
							.attr( 'title' , '(required)' )
							.text( '*' )
							.addClass( 'required' )
					);
				}
				controls.attr( 'required', 'required' );
			} else {
				controls.removeAttr( 'required' );
				question.find( 'abbr[title="(required)"]' ).remove();
			}
		});
	};


}( jQuery ));
