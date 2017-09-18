/*globals grecaptcha, qg*/
var onloadRecaptcha;
/**
 * This file initialises forms
  */
(function( $, swe ) { /* start closure */
	'use strict';


	var initValidation = function() {
		window.initConstraintValidationAPI();
		$( 'form' ).formValidation( 'validate' );
	};


	// now: hookup form validation
	initValidation();

	// document ready: hookup form validation
	$( initValidation );


	// instruction based relevance
	if ( $( '.relevance', 'form' ).length > 0 ) {
		$( 'form', '#content' ).relevance( 'instructions' );
		$( 'form', '#meta-wrapper' ).relevance( 'instructions' );
	}

	//disable form sumission after submit button is clicked
	$('form[data-singlesubmit="true"]').on('submit', function(){
        var loaderEle = $('<i></i>').addClass('disabled fa fa-spinner fa-pulse fa-2x ');
        $(this).find('input[type=submit]').attr('disabled',true);
        $(this).find('input[type=submit]').before(loaderEle);
	});

	//Toggle visibility of form
	$('.form-toggle').unbind('click').on('click',function(e){
		if($(this).hasClass('up')){
			$(this).removeClass('up');
			$(this).parents('.search-widget').find('form').slideDown();
		}
		else {
			$(this).addClass('up');
			$(this).parents('.search-widget').find('form').slideUp();
		}
		e.preventDefault();
	});

	//enable recaptcha on form submits - start
	onloadRecaptcha = function() {
		$('form[data-recaptcha="true"]').find('input[type="submit"]').on('click', function (e) {
			e.preventDefault();
			var subBtn = this,
				form = $(subBtn).parents('form');

			grecaptcha.render(subBtn, {
				'sitekey' : swe.isProduction ? '6LcoIywUAAAAAN-1rq22G-bP3yxl1bBq_5nHJ6s9' : '6LeNGSwUAAAAAD6o-P5UTM0FNpKjYB71Kh70F-Ud',
				'callback' : function () { form.submit(); }
			});
			grecaptcha.execute();
		});

	};

	//enable recaptcha on form submits - end



}( jQuery, qg.swe )); /* end closure */
