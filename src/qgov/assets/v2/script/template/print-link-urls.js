/**
 * This file expands the URL of content links and adds them to the page after the link.
 * These URLs are then hidden for display on screen, but are revealed using CSS
 * for printing.
 * 
 * @requires jQuery
 */

(function( $ ) {
	'use strict';

	/**
	 * printLinkURLs plugin
	 * Pre condition:  Page has been loaded, and contains a content section
	 * Post condition:  Links inside the content section (excluding breadcrumbs) have their full url text added inside a span with a class of 'printOnly'
	 * Exceptions:  If a url exceeds the max allowable number of characters, the function will try to list only the domain of the link (http://whatever.qld.gov.au/...).  
	 *		If the url is relative, no link will be added for long link lengths.
	 *		If the link is a target on the same page, then don't print it's url.
	 */
	$.fn.printLinkURLs = function() {
		
		var printLinkMaxURLLength = 200;
		
		$( this ).filter( 'a[href]' ).each(function() {
			
			// a.href returns an absolute path.
			var linkHref = this.href;
			
			// Test for max length of the URL
			if ( linkHref.length > printLinkMaxURLLength ) {
				// URL is too long! Use the domain name with an ellipses instead
				linkHref = this.protocol + '//' + this.hostname;
			}
			
			// Encode HTML entities (to prevent potential XSS vulnerability)
			linkHref = $('<div/>').text(linkHref).html();
			
			// Append the URL to the 'a' element with a span so it can be hidden
			$( this ).after( '<small class="print-link-url"> ( ' + linkHref + ' )</small>' );
			
		});
	};


	// on ready
	$( document ).ready(function() {
		// Call the function to add in print frienldy url text for all content links
		// (exclude the breadcrumbs and page-options)
		$( '#content-container a, #footer a' )
			.not( '#breadcrumbs a, .page-options a, #fat-footer a, .url, .email, #pagination a, .nav a, .tabs a, .st_tabs a, .search-results a, .search-result a, table a, .key a, .expandable-toggle, #app-geocoding' )
				.printLinkURLs();
	});

}( jQuery ));
