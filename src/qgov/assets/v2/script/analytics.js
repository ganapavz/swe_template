/* globals qg, _gaq:true */

if (!String.prototype.contains) {
    String.prototype.contains = function (arg) {
        'use strict';
        return !!~this.indexOf(arg);
    };
}

(function( $ ) {
	'use strict';


	// var bodyClass = document.body.className;

	// Which environment are we looking at?
	$.debug( 'VHOST: ' + qg.swe.vhost + '; X-Served-By: ' + qg.swe.servedBy );


	// NOT IN USE: no reference to 'pageType' in any other page
	// qg.swe.pageType =
	// 	/\shome\s/.test( bodyClass ) ? 'home' :
	// 	/\sfranchise-index\s/.test( bodyClass ) ? 'franchise-index' :
	// 	/\stheme-index\s/.test( bodyClass ) ? 'theme-index' :
	// 	/\saudience-index\s/.test( bodyClass ) ? 'audience-index' :
	// 	'content-page'
	// ;


	/*
		Standard Google Analytics includes
	*/
	// Register pageview tracking (using single website experience Account ID and 'qgo' tracker ID)
    var protocol = ( /^https?/.test( window.location.protocol )) ? window.location.protocol : 'http:';
	_gaq = ( typeof _gaq !== 'undefined' ) ? _gaq : [];
	_gaq.push(
		[ qg.swe.GATracker + '._require', 'inpage_linkid', protocol + '//www.google-analytics.com/plugins/ga/inpage_linkid.js' ],
		[ qg.swe.GATracker + '._setAccount', qg.swe.GAAccount ],
		[ qg.swe.GATracker + '._trackPageview' ]
	);

	// Only load GA script if it hasn't been loaded already
	if ( $( 'script[src*=".google-analytics.com/ga.js"]' ).length === 0 ) {
		(function() {
			var ga = document.createElement( 'script' ),
				s = document.getElementsByTagName( 'script' )[ 0 ];

			ga.type = 'text/javascript';
			ga.async = true;
			ga.src = ( 'https:' === document.location.protocol ? 'https://ssl' : 'http://www' ) + '.google-analytics.com/ga.js';

			s.parentNode.insertBefore( ga, s );
		}());
	}


	/*
		Google Analytics event tracking configuration (requires jquery.eventful.js)
	*/
	//$.eventful = {}; // This should be initialised already
	$.eventful.debugMode = false; // Set to true for debugging (will disable tracked links, but show debug messages).
	$.eventful.setTracker( qg.swe.GATracker ); // All core events tracked will be attributed to the qgo tracking ID, other trackers can be used alongside.

	// Glue all 'internal' domains together so they can be tracked under the one GA profile
	$.eventful.setInternalSites( qg.swe.internalSites ); // internal sites configured in qgov-environment.js
	$.eventful.glueSites();

	// QG Bar events
	$( '#qg-logo' ).children( 'a' ).trackEvent( 'click', 'global-qg-bar', 'QG logo' );
	$( '#qg-coa' ).children( 'a' ).trackEvent( 'click', 'global-qg-bar', 'QG Coat of Arms' );
	$( 'a', '#header' ).trackEvent( 'click', 'global-qg-bar' );
	// $( '#search-form' ).trackEvent( 'submit', 'global-qg-bar', 'submit: Search' );

	// Breadcrumb events
	$( 'a', '#breadcrumbs .nav-home' ).trackEvent( 'click', 'global-breadcrumbs', 'click: QG Home' );
	$( 'a', '#breadcrumbs' ).trackEvent( 'click', 'global-breadcrumbs' );

	// Access (skip link) events
	$( 'a', '#access' ).trackEvent( 'click', 'global-access' );

	// Footer events
	$( 'a', '#fat-footer' ).trackEvent( 'click', 'global-fat-footer' );
	$( 'a', '#footer' ).trackEvent( 'click', 'global-sub-footer' );

	// Global alert/aside events
	$( 'a', '#asides .global-aside' ).trackEvent( 'click', 'global-aside' );
	$( 'a', '#global-alert' ).trackEvent( 'click', 'global-alert' );

	// Feedback form events
	$( '#page-feedback-useful, #useful-yes' ).trackEvent( 'click', 'global-feedback', 'click: Page was useful' );
	$( '#page-feedback-not-useful, #useful-no' ).trackEvent( 'click', 'global-feedback', 'click: Page was not useful' );
	$( 'a[href="#page-feedback-privacy"]', '#page-feedback' ).trackEvent( 'click', 'global-feedback', 'click: Privacy toggle' );
	$( 'a[href="https://www.qld.gov.au/contact-us/"]', '#page-feedback' ).trackEvent( 'click', 'global-feedback', 'click: Contact us' );
	//$( '#page-feedback form' ).trackEvent( 'submit', 'global-feedback', 'submit: Feedback' ); // form submit interception is causing serious issues with form submissions

	// General form events
	//$( 'form' ).trackEvent( 'submit', 'forms' ); // form submit interception is causing serious issues with form submissions

	// Track external links
	$( 'a:external' ).trackEvent( 'click', 'external-link' ); // :external selector established using $.setInternalSites

	// NOTE only one click event will be tracked (by default)
	// catch all rules should be placed below this line
	// ------------------------------------------------

	// Homepage events
	$( 'a', 'body.home' ).trackEvent( 'click', 'homepage' );

	// Franchise-landing page events
	$( ' a', '.franchise-index, .franchise-index-with-asides' ).trackEvent( 'click', 'franchise-landing-' + qg.swe.franchiseTitle );


	// onready (stats for elements with delayed initialisation)
	$(function() {
		// video controls
		$( '.qg-ovt-controls a' ).each(function() {
			$( this ).trackEvent( 'click', 'video-control', 'click: ' + this.title );
		});
		// video alternatives: transcripts and download
		$( '.qg-ovt-alternatives a' ).each(function() {
			$( this ).trackEvent( 'click', 'video-alternative', 'click: ' + this.title );
		});
	});


}( jQuery ));
