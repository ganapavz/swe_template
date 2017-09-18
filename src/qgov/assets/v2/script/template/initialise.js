/**
 * This file contains general initialisation and configuration to be
 * run on page load (or just before </body>). Where initialisation is
 * required sooner than this (for example: the transformer layout script
 * for IE 6-8 must be initialised ASAP to avoid flicker), scripts have
 * been loaded in the head and initialised just after <body> for the
 * relevant browsers using conditional comments.
 *
 * This file also contains some simple functionality like show/hide
 * #access keys or ARIA roles/relationships that didn't warrant a
 * separate javascript file.
 *
 * @requires jquery
 * @requires jquery.aria.js
 * @requires jquery.aria.key-nav.js
 * @requires jquery.aria.labelledby.js
 * @requires jquery.print-link-urls.js
 * @requires jquery.qg-drop-down.js
 * @requires jquery.page-options.js
 */

/* globals qg*/
(function( $ ) { /* start closure */
	'use strict';


	/* Ensure IE6 caches background images (avoid flicker) */
	if ( qg.oldIE && qg.oldIEversion < 7 ) {
		document.execCommand( 'BackgroundImageCache', false, true );
	}


/* Markup enhancements */

	/* Add markup to support side-by-side comparisons */
	$( '.comparison' ).each(function() {

		var $this = $( this );
		if ( ! $this.children( ':first-child' ).is( '.comparison-inner' )) {
			$this.wrapInner( '<div class="comparison-inner" />' );
		}
		if ( $this.prev( '.comparison' ).length === 0 ) {
			$this.addClass( 'comparison-first' );
		} else if ( $this.next( '.comparison' ).length === 0 ) {
			$this.addClass( 'comparison-last' );
		}
	});

	// on ready: Initialise floated images with captions
	/*$(function() {
		var figuresWithWidth = $( '.cut-in, .cut-in-alt' ).filter(function() {
				return $( this ).find( 'img' ).removeAttr( 'width' ).eq( 0 ).width() > 0;
			});

		// initialise images with known widths
		figuresWithWidth.flowt({
			containerClass  : 'cut-in',
			captionSelector : '.caption, .caption-large',
			activeClass     : 'cut-in-active'
		});
		figuresWithWidth.flowt({
			containerClass  : 'cut-in-alt',
			captionSelector : '.caption, .caption-large',
			activeClass     : 'cut-in-active'
		});

		// initialise images without known widths when last image loads
		$( '.cut-in, .cut-in-alt' ).not( figuresWithWidth ).find( 'img' ).eq( -1 ).bind( 'load', function() {
			window.setTimeout(function() {
				$( '.cut-in' ).not( figuresWithWidth ).flowt({
					containerClass  : 'cut-in',
					captionSelector : '.caption, .caption-large',
					activeClass     : 'cut-in-active'
				});
				$( '.cut-in-alt' ).not( figuresWithWidth ).flowt({
					containerClass  : 'cut-in-alt',
					captionSelector : '.caption, .caption-large',
					activeClass     : 'cut-in-active'
				});
			}, 0 );
		});

	});
*/

	// Init access keys
	$( '#access' )
		.addClass( 'hidden' )
		.bind( 'focusin', function(){
			$( '#access' ).addClass( 'visible' );
		})
		.bind( 'focusout', function(){
			$( '#access' ).removeClass( 'visible' );
		})
	;


	// Add ARIA landmark roles to elements that require semantic clarification.
	// Landmark roles
	$( '#header' ).ariaRole( 'banner' );
	$( '#access, #tools, #nav-site, #nav-section, #breadcrumbs, #fat-footer' ).ariaRole( 'navigation' );
	$( '#search-form, .search-box-group' ).ariaRole( 'search' );
	$( '#footer' ).ariaRole( 'contentinfo' );
	$( '#content' ).ariaRole( 'main' );
	$( '.article' ).ariaRole( 'article' ); // article is sub-role of document
	$( '.application #content .article, #content.application .article' ).ariaRole( 'application' ); // application role should replace article role for applications
	$( '.aside' ).ariaRole( 'complementary' );
	// $( '.max-width, .box-sizing' ).ariaRole( 'presentation' );

	// Landmark labels
	$( '#access, #header, #nav-site, #nav-section, #breadcrumbs, #fat-footer, .aside, #page-feedback' ).labelledBy( 'h2' ); // #tools is not labelled at this time
	//$( '#nav-site ul li, .page-options ul li' ).labelledBy( 'a' ); // the first link within is the label
	$( '#fat-footer .section' ).labelledBy( 'h3' );
	$( '#content, .article' ).labelledBy( ':header' );
	// no longer present in template
	// $( '.search-scope, #page-feedback .select1 fieldset' ).labelledBy( 'strong' );
	$( '#footer' ).labelledBy( 'h2:not(#fat-footer h2)' );

	// Supplement media query support for (currently webkit) browsers
	// that don't recalculate media queries on zoom.
	// Use a timeout so that this event is not fired repeatedly
	// during window resize events.
	// Remove this script once webkit browsers commonly don't need this
	// supplement and/or uncomment the version test below and add the
	// appropriate webkit version which no longer requires this supplement.
	// if ( $.browser.webkit /* && $.browser.version < 540*/) {
	// 	(function() { // start closure
	// 		var zoomTimeoutId = null;

	// 		$( window ).resize(function () {
	// 			if ( zoomTimeoutId !== null ) {
	// 				window.clearTimeout( zoomTimeoutId );
	// 			}
	// 			zoomTimeoutId = window.setTimeout(function(){
	// 				var triggerRecalc = $( '<style type="text/css">' );
	// 				$( 'head' )
	// 					.prepend( triggerRecalc )
	// 					//.remove( triggerRecalc )
	// 				;
	// 			}, 300);
	// 		});
	// 	}()); // end closure
	// }

	// Add compact form label to #tools search input
	$( '#search-query' ).not( '[placeholder]' ).each(function() {
		// use .each() so this doesn't run if not needed
		$( this ).compactFormLabel();
	});


/* Content enhancements */

	// No lightbox for IE6 (too hard for now)
	if ( ! qg.oldIE || qg.oldIEversion >= 7 ) {
		/* Enhance all image links with a lightbox */
		$( 'a[href$=".jpg"], a[href$=".png"], a[href$=".gif"], a.map, a.definition' ).not( '.download' ).butterfly({
			closeButton: true,
			closeButtonCorner: 'tr',
			galleryContainers: '.image-gallery',
			closeButtonImage: qg.swe.paths.assets+'images/skin/button-close.png'
		});
	}

    /* Lightbox for data pages */

    if ($('body').attr('data-site-root')) {
        $('a.lightbox').butterfly({
            contentDefaultWidth: '50%',
            contentDefaultHeight: '50%',
            mediaMaxWidth: '50%',
            mediaMaxHeight: '50%',
            treatAsMedia: false,
            lightBoxMargin: null
        });
    }

	/* Stripe tables */
	$('table')
		.addClass('striped')
		.find('tr:odd').not('thead tr').addClass('even')
	;


	/* New initialisation activities */

	if ($('body.residents').length > 0) {
		$('#nav-site .nav-residents').addClass('current-area');
	} else if ($('body.business').length > 0) {
		$('#nav-site .nav-business').addClass('current-area');
	/*} else if ($('#breadcrumbs li.nav-contact').length > 0) {
		$('#tools .nav-contact').addClass('current-area');
		*/
	} else if ($('#breadcrumbs a').length === 0 && window.location.pathname.substr(window.location.pathname.lastIndexOf('/')) === '/') {
		$('#nav-site .nav-home').addClass('current-area');
	// } else {
		//console.log('not sure where in the site we are: assume non-residents or contact us');
	}

	// Link up the alert message if present
	if ( $.linkedUpConf ) {
		$( '#global-alert' ).linkedUp();
	}


}( jQuery, qg )); /* end closure */
