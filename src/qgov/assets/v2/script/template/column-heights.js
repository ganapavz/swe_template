/**
 * Column heights
 *
 * This file ensures that the content column is always longer than the asides and the section nav.
 * This is a requirement of this design at high resolutions (i.e: 3 column 'layout-large' mode).
 *
 * TODO: Recalculate after text size changes as well as window resize events.
 *
 * @requires jquery
 */
/*global qg*/
(function( $, qg ) { /* start closure */
	'use strict';


	var

	checkColumnHeights = function() {
		var contentEl, contentHeight, asidesHeight, navHeight, pageOptionsTop;
		// console.log( 'checkColumnHeights' );

		contentEl = $( '.article' ).eq( 0 ); // this design currently only supports a single .article element

		// Don't check too often (onces per 150ms at most)
		if ( window.ResizeEvents.throttle( checkColumnHeights , 150 )) {
			if ( ! qg.oldIE ) { // IEs check far too often, so this becomes an issue, not sure why...
				contentEl.css( 'height', 'auto' );
			}
			return;
		}

		//contentEl = $( '.article:first > .box-sizing > .border' ); // this design currently only supports a single .article element
		contentEl.css( 'height', 'auto' );
		contentHeight = contentEl.height();


		if ( qg.swe.isMobile || qg.swe.isTablet ) {
			// no columns on mobile and tablet
			return;
		}

		// if no asides
		if ( $( '#asides' ).length === 0 || $( '#asides .aside' ).length === 0 ) {
			asidesHeight = 0;
		} else {
			// measure height of asides
			asidesHeight = $( '#asides' ).height();
		}

		// check for page options overlapping nav
		if ( $( '#nav-section' ).length ) {
			navHeight = $( '#nav-section' ).height();
			pageOptionsTop = $( '#post-page-options,#footer' ).offset().top - contentEl.offset().top;

			if ( navHeight > pageOptionsTop ) {
				navHeight = ( contentHeight > asidesHeight ? contentHeight : asidesHeight ) + navHeight - pageOptionsTop;
			}

			if ( navHeight > asidesHeight ) {
				// use nav height
				asidesHeight = navHeight;
			}
		}

		// ensure content is taller
		if ( contentHeight < asidesHeight ) {
			contentEl.height( asidesHeight );
		}
	};

	// Required on all pages other than 'home'
	if ( $( 'body.home' ).length === 0 ) {
		checkColumnHeights();
		$( window ).resize( checkColumnHeights );
		// run again to deal with show/hide height changes
		$( window.document ).ready( checkColumnHeights );

		// The ResizeEvents watcher will trigger x-height-change event when the height (of these element's contents) changes
		//$( '.article:first > .box-sizing > .border, #asides, #nav-section' ).registerWatcher( 'height' );

		// listen for height changes within the content
		$( '#page-container' ).bind( 'x-height-change relevant-done irrelevant-done', checkColumnHeights );
	}
}( jQuery, qg )); /* end closure */
