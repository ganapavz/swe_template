/**
 * Figures
 * 
 * Show/hide credits for figures
 * 
 * @requires jQuery
 */

/*global qg*/
$(function() {
	'use strict';


	var figureElement = 'figure, .figure, .cut-in, .cut-in-alt';


	// toggle show/hide credits
	$( '#page-container' ).delegate( '.figure-credits-toggle', 'click', function() {

		$( this )
			// show credits
			.closest( figureElement )
				.find( '.figure-credits' )
					.slideDown( 500, function() {
						$( this ).trigger( 'x-height-change' );
					})
					// focus on caption
					.focus()
					.end()
				.end()
			// remove the toggle
			.fadeOut( 1337 );
	});


	// find figures with credits
	$( '.figure-credits', figureElement ).each(function() {

		$( this )
			// add a toggle before the credits
			.before( '<button class="figure-credits-toggle" title="View credits"><img src="' + qg.swe.paths.assets + 'images/skin/icon-image-credit.png" alt"View credits" /></button>' )
			// hide the credits
			.hide()
			// trigger layout reflow
			.trigger( 'x-height-change' )
		;
	});


});
