(function( $ ) {
	'use strict';

	var xorConstraintSubmitHandler = function( event ) {
			// has one of the required fields been answered?
			var xorFields = event.data[ 0 ],
				validationMessage = event.data[ 1 ],
				xorConstraintMet = xorFields.filter(function() {
					return this.value.length > 1;
				}).length > 0
			;

			xorFields.each(function() {
				this.setCustomValidity(
					xorConstraintMet ? '' : validationMessage
				);
			});
		},

		xorConstraintChangeHandler = function( event, validationUiRefreshOnly ) {
			if ( validationUiRefreshOnly === true ) {
				// pass through to other change handlers
				return;
			}

			var xorFields = event.data[ 0 ];

			// constraint validity check
			xorConstraintSubmitHandler( event );

			// trigger validation UI  on other fields?
			if ( event.type === 'change' ) {
				xorFields.not( event.target ).triggerHandler( 'change', true );
			}
		}
	;


	// plugin
	$.fn.initXorConstraint = function( validationMessage ) {
		// custom validation for XOR options
		this.closest( 'form' ).on( 'submit', [ this, validationMessage ], xorConstraintSubmitHandler );
		this.on( 'change', [ this, validationMessage ], xorConstraintChangeHandler );
	};


}( jQuery ));
