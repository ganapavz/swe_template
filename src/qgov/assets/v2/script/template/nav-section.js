// onready
$((function( $ ) {
	'use strict';

	var currentFilename = window.location.pathname.substr( window.location.pathname.lastIndexOf( '/' ) + 1 ),
		currentPageTitle
	;

	// already have current page highlighted?
	if ( $( '.current-page', '#nav-section' ).length === 0 ) {

		// Highlight current area in section nav
		if ( $( '#guide-title' ).length > 0 ) {
			// Grab guide title for guide pages
			currentPageTitle = $( '#guide-title' ).text();

		} else if ( $( 'meta[name="DCTERMS.alternative"]' ).length > 0 && $( 'meta[name="DCTERMS.alternative"]' ).eq( 0 ).attr( 'content' ) !== '' ) {
			// check alternative title first
			currentPageTitle = $( 'meta[name="DCTERMS.alternative"]' ).eq( 0 ).attr( 'content' );
		} else {
			// Otherwise grab title from the first H1
			(function() {
				var titleClone = $( 'h1', '#content' ).eq( 0 ).clone();
				titleClone.find( '.page-number' ).remove();
				currentPageTitle = titleClone.text();
			}());
		}

		$( 'li', '#nav-section' ).filter(function() {
			return $.trim( $( this ).text() ) === currentPageTitle;
		}).eq( 0 ).addClass( 'current-page' );
	}


	// Highlight current area in TOC
	if ( document.getElementById( 'toc' ) !== null ) {
		// mark current page in guide
		$( 'a[href="' + currentFilename + '"]', '#toc' ).parent().addClass( 'current' );
		$( '.link-text', '#toc' ).filter(function() {
			return $.trim( $( this ).text() ) === $( 'h2', '#content' ).eq( 0 ).text();
		}).closest( 'li' ).addClass( 'current' );

		// Embed progress menu for pages that contain it (don't do this for the business franchise)
		$( '.current-page', '#nav-section' )
			.addClass( 'has-submenu' )
			.append( $( '#toc ol' ).clone() )
		;
	}


	// Highlight current area in progress bar
	if ( $( '#guide-progress' ).length > 0 ) {
		$( 'a[href="' + currentFilename + '"]', '#guide-progress' ).parent().addClass( 'current' );
	}

}( jQuery )));