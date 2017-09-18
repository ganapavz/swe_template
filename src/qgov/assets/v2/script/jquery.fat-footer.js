/**
 * This file contains keyboard navigation code for the fat footer.
 * Left and right arrow keys should take you between fat footer sections
 * (.section) and up and down arrows take you up and down the list within 
 * each section.
 * 
 * @requires jquery
 * @requires jquery.aria.js
 * @requires jquery.aria.key-nav.js
 */

/*global DOM_VK_LEFT, DOM_VK_RIGHT */
(function( $, DOM_VK_LEFT, DOM_VK_RIGHT ) { /* start closure */
	'use strict';


	var ffooterKeyHandlers = {},


	/**
	 * Handler for left arrow key when pressed within the fat footer.
	 * Move focus to the previous section, or if there are no previous sections
	 * move to the last section (cyclical).
	 */
	fatFooterLeftKeyEvent = function() {
		
		var toBeFocused = $( this ).prev().find( 'a[tabindex=0]' );
		if ( toBeFocused.length === 0 ) {
			toBeFocused = $( this ).siblings( '.section' ).last().find( 'a[tabindex=0]' );
		}
		
		toBeFocused
			.attr( 'tabindex', 0 )
			.focus()
		;
	},
	
	
	/**
	 * Handler for right arrow key when pressed within the fat footer.
	 * Move focus to the next section, or if there are no more sections
	 * move to the first section (cyclical).
	 */
	fatFooterRightKeyEvent = function() {
		
		var toBeFocused = $( this ).next().find( 'a[tabindex=0]' );
		if ( toBeFocused.length === 0 ) {
			toBeFocused = $( this ).siblings( '.section' ).first().find( 'a[tabindex=0]' );
		}
		
		toBeFocused
			.attr( 'tabindex', 0 )
			.focus()
		;
	};
	
	
	
	// Add ARIA keyboard navigation to fat footer
	ffooterKeyHandlers[ DOM_VK_LEFT ] = fatFooterLeftKeyEvent;
	ffooterKeyHandlers[ DOM_VK_RIGHT ] = fatFooterRightKeyEvent;
	$( '#fat-footer .section' ).managefocus(
		'a', {
			role  : 'menu',
			ignoreKeys  : [ DOM_VK_LEFT, DOM_VK_RIGHT ],
			keyHandlers : ffooterKeyHandlers
		}
	);
	
}( jQuery, DOM_VK_LEFT, DOM_VK_RIGHT )); /* end closure */
