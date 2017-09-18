/**
 * Dump debug messages to console if available, otherwise to status bar.
 *
 * @version 0.2
 * Changelog:
 *   *  0.1 Initial implementation
 *   *  0.2 cleanup for jslint; optimisations
 *   *  0.3 join all arguments into one string for logging
 *
 * @author Andrew Ramsden, Ben Boyle
 * @license GNU GENERAL PUBLIC LICENSE (GPL) <http://www.gnu.org/licenses/gpl.html>
 * 
 * @requires jQuery (tested with 1.4.4) <http://jquery.com/>
 * 
 */
(function( $ ) {// start closure
	'use strict';


	/**
	 * Dump debug messages to console if available, otherwise to status bar.
	 */
	$.debug = function() {
		var console = window.console;

		if ( typeof console !== 'undefined' && typeof console.log === 'function' ) {
			console.log.apply( console, Array.prototype.slice.call( arguments ));
		// remove comments on else condition if testing IE6 issues in dev environment (do not use for production)
		// } else {
			// TODO join arguments to get string
			//window.status = message;
		}
	};


}( jQuery ));
