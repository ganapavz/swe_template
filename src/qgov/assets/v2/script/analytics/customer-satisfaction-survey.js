/*
(function( $ ) {
	'use strict';

	var surveyUrl = 'getinvolved.qld.gov.au/gi/consultation/1619/survey/1563/view.html',
	    surveyQuestion = 'Name or web address of the service you came from',
	    surveyLinks,
	    referer, referer2
	;

	// if this page IS the customer satisfaction survey
	if ( window.location.href.indexOf( surveyUrl ) !== -1 ) {
		// read params
		referer = $.url().param( 'referer' ) || document.referrer;
		referer2 = $.url().param( 'referer2' ) || '';

		// find .label that matches survey Question
		$( '.label', '#content' ).filter(function() {
			return $( this ).text().indexOf( surveyQuestion ) !== -1;
		})
			// find textarea in fieldset
			.closest( 'fieldset' )
				.find( 'textarea' )
					.val(
						decodeURIComponent( referer ).split( '|' ).join( '\n' ) + '\n' +
						decodeURIComponent( referer2 )
					)
		;

	} else {

		// find links to customer satisfaction survey URL
		surveyLinks = $( 'a' ).filter(function() {
			return this.href.indexOf( surveyUrl ) !== -1;
		});

		// if this page has survey links...
		if ( surveyLinks.length > 0 ) {
			// if this is not a PAPI page
			if ( window.location.host.indexOf( 'smartservice.qld.gov.au' ) === -1 ) {
				// append the URL and referer
				referer = window.location.href;
				referer2 = document.referrer;

			} else {
				// append the product names
				referer = $( 'strong', '.receipt' ).length > 0 ? 'strong' : '.description';
				referer = $.map( $( referer, '.receipt' ), function( e ) {
					return $( e ).text();
				}).join( '|' );
				referer2 = '';
			}

			surveyLinks.each(function() {
				this.href += '?referer=' + encodeURIComponent( referer ) + '&referer2=' + encodeURIComponent( referer2 );
			});
		}

	}



}( jQuery ));
*/