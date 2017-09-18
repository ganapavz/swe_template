// custom script for smartjobs
(function( $ ) {
// ondomready
$(function() {
	var advancedSearchToggleHandler,
		fieldSizes,
		revealFeedbackSection
	;


	// add advanced search toggle
	advancedSearchToggleHandler = function() {
		$( '#advanced-search' ).forcesRelevance( 'relevant', $( '#advanced-search-toggle' ).is( ':checked' ));
	};

	$( '#advanced-search' ).before( '<li><input type="checkbox" id="advanced-search-toggle" /> <label for="advanced-search-toggle">More search options</label></li>' );
	$( '#advanced-search-toggle' ).click( advancedSearchToggleHandler );
	advancedSearchToggleHandler();


	// lightbox for links in labels
	$( 'a', 'label' ).butterfly();


	// adjust sizes of fields on application form
	var fieldSizes = {
		'in_email' : 40,
		'in_phone' : 20,
		'in_contact_addr3' : 20, // suburb
		'in_contact_addr5' : 5 // postcode
	};

	$( 'input', '#content' ).filter( ':text' ).each(function() {
		var input = $( this );
		if ( typeof fieldSizes[ input.attr( 'name' ) ] === 'number' ) {
			input.attr( 'size', fieldSizes[ input.attr( 'name' ) ]);
		}
	});


	// add upcoming changes alert to home page
	if ( /jobsearch/.test( location.pathname )) {
		$( '.border', '#asides' ).eq( 0 ).prepend(
			
			'<div class="aside feedback">'+
				'<h2>Changes to SmartJobs</h2>'+
				'<p>To make SmartJobs easier to use, the search controls, search results and application form have changed.</p>'+
				'<p>If you have any feedback about these changes, please <a href="#page-feedback">let us know</a>&mdash;this will help us to find ways of making this site even better.</p>'+
			'</div>'

		);

		revealFeedbackSection = function() {
			if ($(this).is('#page-feedback-not-useful, #page-feedback-useful') && ! $('#page-feedback').is(':hidden')) {
				return; // already revealed
			}
			
			// Reveal section, and shift focus to revealed section (important for accessibility)
				if (! $('#page-feedback').is(':hidden')) {
					$('#page-feedback').hide();
				}
				
				window.location.hash = 'page-feedback';
				$('#page-feedback')
					.fadeIn()
					.find('form:first')
						.attr('tabindex', 0)
						.focus()
				;
				
				$.scrollTo('#page-feedback', 800);
				
			return false; // prevent link from being followed (default behaviour)
		};

		$( 'a[href$=#page-feedback]' ).not( '#page-feedback-not-useful, #page-feedback-useful' ).click( revealFeedbackSection );
	}


	// add 'contact us' link in feedback form on core pages
	$( '.instruction', '#page-feedback' ).eq( 0 )
		.append( '<p>We do not reply to feedback. <a href="https://www.qld.gov.au/contact-us/">Contact us if you need a response</a>.</p>' )
	;


});
}( jQuery ));
