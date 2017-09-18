/* This is not the jquery migrate plugin: https://github.com/jquery/jquery-migrate/
BUT it does borrow from it, to polyfill selected legacy code required by SWE pages */

// IIFE (runs immediately)
(function( $ ) {
	'use strict';

	if ( typeof $.fn.live !== 'function' ) {
		$.fn.live = function( types, data, fn ) {
			$( this.context ).on( types, this.selector, data, fn );
			return this;
		};
	}

}( jQuery )); //IIFE