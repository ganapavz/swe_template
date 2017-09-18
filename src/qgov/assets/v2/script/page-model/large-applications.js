/*
	support for large applications page model in QGov template

	API to show/hide the tools and info panels
	Set initial state hidden
*/

/* globals qg */
(function( $, swe ) {
	'use strict';

	// large applications API
	swe.pageModel = {};


	// tools panel
	swe.pageModel.refresh = function( properties ) {
		var newClass,
			classNames = [
				'viewport',
				'viewport-tools',
				'viewport-tools-info',
				'viewport-info'
			],

			viewport = $( '#app-viewport' ),
			toolsPanel = $( '#app-viewport-tools' ),
			infoPanel = $( '#app-viewport-info' ),
			// check for negative margins
			toolsVisible = ! /^-/.test( toolsPanel.css( 'margin-left' )),
			infoVisible = ! /^-/.test( infoPanel.css( 'margin-right' ))
		;


		if ( properties.show ) {
			switch ( properties.show ) {
			case 'viewport-tools':
				toolsVisible = true;
				// is info already visible? does it cover more than half the viewport?
				if ( infoVisible && infoPanel.offset().left < ( viewport.offset().left + viewport.width() ) / 2 ) {
					infoVisible = false;
				}
				break;
			case 'viewport-info':
				infoVisible = true;
				// is tools already visible? does it cover more than half the viewport?
				if ( toolsVisible && toolsPanel.offset().left + toolsPanel.width() > ( viewport.offset().left + viewport.width() ) / 2 ) {
					toolsVisible = false;
				}
				break;
			}
		} else if ( properties.hide ) {
			switch ( properties.hide ) {
			case 'viewport-tools':
				toolsVisible = false;
				break;
			case 'viewport-info':
				infoVisible = false;
				break;
			}
		} else if ( properties.toggle ) {
			switch ( properties.toggle ) {
			case 'viewport-tools':
				toolsVisible = ! toolsVisible;
				break;
			case 'viewport-info':
				infoVisible = ! infoVisible;
				break;
			}
		}

		newClass = 'viewport' + ( toolsVisible ? '-tools' : '' ) + ( infoVisible ? '-info' : '' );

		classNames = $.map( classNames, function( element ) {
			return element === newClass ? null : element;
		});

		$( '#large-application' ).addClass( newClass ).removeClass( classNames.join( ' ' ));

		// search tools should be positioned on the viewport when tools are hidden
		$( '.search', '#app-viewport-tools' ).toggleClass( 'viewport', ! toolsVisible );
	};


	// reset the pageModel
	swe.pageModel.initialise = function() {
		$( '#large-application' ).addClass( 'viewport' ).removeClass( 'viewport-tools viewport-tools-info viewport-info' );
		// search tools should be positioned on the viewport when tools are hidden
		$( '#app-viewport-tools' ).removeClass( 'search-results' );
		$( '.search', '#app-viewport-tools' ).addClass( 'viewport' );
	};


	// initially hidden
	swe.pageModel.initialise();
	$( '#app-viewport' ).append( '<div id="app-viewport-overlay"/>' );


	// clicking on the viewport overlay should hide the panels
	$( '#large-application' ).on( 'click', '#app-viewport-overlay', function() {
		swe.pageModel.initialise();
	});


	// clicking search button should show search tools
	$( 'form', '#app-viewport-tools' ).on( 'submit', function() {
		$( '#app-viewport-tools' ).addClass( 'search-results' );
		swe.pageModel.refresh({ show: 'viewport-tools' });
	});


}( jQuery, qg.swe ));
