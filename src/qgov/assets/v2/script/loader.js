/**
 * load libraries as required.
 * This file is separate to init.js so that it blocks init just long enough for the dependencies to be ready.
 * Note: 'blocks' = synchronously, not async
 */

/* jshint evil: true, expr:true */
/* globals qg, Modernizr */
(function( qg, Modernizr, $ ) {
	'use strict';

	var pageModel = 'misc';

	var clickToChatUrls = [
		// BDM historical records
		//'//www.bdm.qld.gov.au/IndexSearch/',
		//'//www.qld.gov.au/law/births-deaths-marriages-and-divorces/changing-your-name/changing-your-name-through-marriage/',
		// Seniors Card
		'//secure.communities.qld.gov.au/chiip/senior-card/apply/',
		//'//www.qld.gov.au/seniors/legal-finance-concessions/seniors-card/',
		// local development
		'//localhost/test/visual/'
	];

	var ifUrlMatches = function( urls ) {
		var url = window.location.href;

		for ( var i = 0; i < urls.length; i++ ) {
			if ( url.indexOf( urls[ i ] ) !== -1 ) {
				return true;
			}
		}

		return false;
	};


	// load a script immediately using document.write
	function writeScript( url ) {
		document.write( '<script type="text/javascript" src="' + url + '"></script>' );
	}

	// lazy load a script
	function lazyScript( url ) {
		$( 'head' ).append( '<script type="text/javascript" src="' + url + '"></script>' );
	}

	// lazy load css
	function lazyStyle( url ) {
		$( 'head' ).append( '<link rel="stylesheet" href="' + url + '" />' );
	}

	//load Google APi
	function loadGoogle (callback) {
		if($('#googleapi').length<=0) {
			var s = document.createElement('script'),
				u = 'https://maps.googleapis.com/maps/api/js?key='+ (window.location.hostname==='www.qld.gov.au'? 'AIzaSyAqkq7IK18bsh-TUMmNR-x9v9PsptT3LMY' : 'AIzaSyCKuaFIFo7YYZXHZ5zaiEZdJx0UBoyfuAE') +'&region=AU&libraries=places';
			s.type = 'text/javascript';
			s.id = 'googleapi';
			s.src = u;
			document.getElementsByTagName( 'head' )[0].appendChild( s );
			s.onreadystatechange= function () { //trigger for IE
				if (this.readyState === 'complete') {
					lazyScript(callback);
				}
			};
			s.onload = function () {
				lazyScript(callback);
			};
		}
		else { //if script is already created but either loading or loaded
			if(document.readyState === 'loading') {
				document.onreadystatechange= function () {
					if (this.readyState === 'complete') {
						lazyScript(callback);
					}
				};
			}
			else {
				lazyScript(callback);
			}
		}

	}
	// script loaded
	qg.swe.loaded = function( funcName, newFunction ) {
		var args, funcData;
		funcData = qg.swe.load[ funcName ];
		qg.swe[ funcName ] = newFunction;
		// execute all queued function calls
		while ( funcData.q.length > 0 ) {
			args = funcData.q.shift();
			qg.swe[ funcName ].apply( qg.swe, args );
		}
		// cleanup
		delete qg.swe.load[ funcName ];
	};


	// CORE TEMPLATE SCRIPTS

	// only load qgov.js if not already loaded
	if ( typeof qg.swe.scriptsLoaded === 'undefined' ) {
		writeScript( qg.swe.paths.assets + 'script/qgov.js' );
	}


	// PAGE MODELS
	if ( document.getElementById( 'ia' ) !== null || $( document.body ).hasClass( 'home' ) || $( document.body ).hasClass( 'page-news' )) {
		pageModel = 'index';
	} else if ( document.getElementById( 'large-application' ) !== null ) {
		pageModel = 'large-app';
	}

	// load maps and data BAM/SAM pattern
	if ( $( '#dataset', '#app-viewport' ).length > 0 ) {
		lazyStyle( qg.swe.paths.assets + 'style/qgov-map.css' );
		writeScript( qg.swe.paths.assets + 'script/qgov-maps-directory.js' );
	}

	// pagemodel CSS
	if ( $( 'link' ).filter( '[href$="/qgov-' + pageModel + '.css"]' ).length === 0 ) {
		lazyStyle( qg.swe.paths.assets + 'style/qgov-' + pageModel + '.css' );
	}

	// load misc IE SWE styles (if qgov-ie.css is loaded)
	if ( qg.oldIE ) {
		lazyStyle( qg.swe.paths.assets + 'style/qgov-misc-ie.css' );
	}

	// pagemodel JS
	if ( $( 'script' ).filter( '[src$="/qgov-' + pageModel + '.js"]' ).length === 0 ) {
		writeScript( qg.swe.paths.assets + 'script/qgov-' + pageModel + '.js' );
	}


	// form validation
	if ( qg.swe.load.formValidation === true || $( 'input, select, textarea' ).filter( '[required]' ).length > 0 ) {
		// load and execute immediately for custom script dependency
		writeScript( qg.swe.paths.assets + 'script/qgov-forms.js' );
		if($('form[data-recaptcha="true"]').length>0) {	//enable recaptcha on form submits
			lazyScript('https://www.google.com/recaptcha/api.js?onload=onloadRecaptcha&render=explicit');
		}
	}


	// POLYFILLS

	// placeholders polyfill? IE6-8 handled in ie-layout.js
	if ( ! qg.swe.oldIE && ! Modernizr.input.placeholder ) {
		lazyScript( qg.swe.paths.assets + 'script/placeholders.js' );
	}


	// PATTERN / PAGE MODEL SUPPORT

	// check swe.load queue
	$.each( qg.swe.load, function( funcName, funcData ) {
		if ( typeof funcData.url !== 'undefined' ) {
			writeScript( qg.swe.paths.assets + 'script/' + funcData.url );
		}
	});


	// slideshow on misc pages
	if ( pageModel === 'misc' && $( '.news-items' ).length > 0 ) {
		lazyScript( qg.swe.paths.assets + 'script/slideshow.js' );
	}

	// xml reader on index pages
	if ( pageModel === 'index' && $('.qg-xml-content').length > 0 ) {
		writeScript(qg.swe.paths.assets + 'script/qg-xml-reader.js');
	}

    // loan calculator
	if ($('#qg-bond-loan-calculator').length > 0 ) {
		writeScript(qg.swe.paths.assets + 'script/qg-loan-calculator.js');
	}

	// video: only load video js+css if a video exists on the page
	if ( $( '.qg-ovt' ).length > 0 ) {
		lazyStyle( qg.swe.paths.assets + 'style/qgov-video.css' );
		lazyScript( qg.swe.paths.assets + 'script/qgov-video.js' );
	}

	// footable (collapsible) tables
	if ( $( '.footable' ).length > 0 ) {
		writeScript( qg.swe.paths.assets + 'script/libs/footable.js' );
		document.write( '<script>$( \'.footable\' ).footable();</script>' );
	}


	// load maps on counters search results page
	// implements the google asynch load method
	if($('.qgov-maps').length > 0) {
		setTimeout(function(){
			if($('script[src$="qgov-maps.js"]').length<=0){
				// lazyScript( qg.swe.paths.assets + 'script/qgov-maps.js' );
				loadGoogle( qg.swe.paths.assets + 'script/qgov-maps.js' );
			}

		},200);
	}

    if ( $('#quick-exit').length > 0 ) {
        writeScript(qg.swe.paths.assets + 'script/qg-quick-exit.js');
	}
    if ( $('#toc.qg-print-guide').length > 0 ) {
        writeScript(qg.swe.paths.assets + 'script/qg-print-guide.js');
    }
	if ( $( 'ol.counters' ).length > 0 ) {
		writeScript( qg.swe.paths.assets + 'script/qgov-maps-counters.js' );
		writeScript( 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=initMaps&region=AU' );
	}

	//load maps and search results
	if ( $( 'ol.counters-new' ).length > 0 ) {
		writeScript( qg.swe.paths.assets + 'script/qgov-counters.js' );
		writeScript( 'https://maps.googleapis.com/maps/api/js?key='+ (window.location.hostname==='www.qld.gov.au'? 'AIzaSyAqkq7IK18bsh-TUMmNR-x9v9PsptT3LMY' : 'AIzaSyCKuaFIFo7YYZXHZ5zaiEZdJx0UBoyfuAE') +'&amp;libraries=places&amp;callback=initMaps&region=AU' );
	}

	//loads counter details
	if ( $( 'h1.counter-view' ).length > 0 ) {
		writeScript( qg.swe.paths.assets + 'script/qgov-view-counters.js' );
	}
	//loads counter details
	if ( $( '.view-result' ).length > 0 ) {
		setTimeout(function(){
			if($('script[src$="qgov-view-result.js"]').length<=0){
				loadGoogle(qg.swe.paths.assets + 'script/qgov-view-result.js' );
			}

		},200);
	}

	// click to chat
	if ( ifUrlMatches( clickToChatUrls )) {
		// don't load async, zoho script uses onload event to render button (async breaks in IE9)
		writeScript( qg.swe.paths.assets + 'script/click-to-chat.js' );
		writeScript( 'https://livedesk.zoho.com/queenslandgovernment/button.ls?embedname=queenslandgovernment' );
	}

	// apps tools
	// if ( $('#tool-sections' ).length > 0 ){
	// 	// apps-tools: only load apps-tools js if required
	// 	writeScript( qg.swe.paths.assets + 'script/apps-tools.js' );
	// }

	// beforeafter: only load beforeafter js if required
	if( $( '.beforeafter' ).length > 0 ) {
		lazyScript( qg.swe.paths.assets + 'script/jquery-ui-1.8.13-min.js' );
		lazyScript( qg.swe.paths.assets + 'script/before-after.js' );
	}

	if ( $( '.data-table' ).length > 0 ) {
		lazyScript( qg.swe.paths.assets + 'script/data-tables.js' );
	}

	//load social media script in presence
	if ( $('.qg-social-media').length > 0) {
        // lazyStyle( qg.swe.paths.assets + 'style/qg-social-media.css' );
		writeScript( qg.swe.paths.assets + 'script/qg-social-media.js' );
	}

	// load customer satisfaction survey (if not already present)
	// $(function() {
	// 	if ( $( 'script' ).filter( '[src$="/customer-satisfaction-survey.js"]' ).length === 0 ) {
	// 		lazyScript( qg.swe.paths.assets + 'script/customer-satisfaction-survey.js' );
	// 	}
	// });

	//Enabling My-account login start
	// $.getJSON('/assets/apps/widget/my-account-login.json')
	// 	.done(function(data){
	// 		var urls = data.allowedPaths || [];
	// 		if (urls.indexOf(window.location.pathname)>=0) {
	// 			$('#tools').append('<li class="qg-avatar-container"><div id="qg-avatar"></div></li>');
	// 			qg.swe.cidmNeoConfig = data;
	// 			lazyScript('/assets/v2/script/qg-myaccount-login.js');
	// 		}
	// 	})
	// 	.fail(function(err){console.log(err);});
	//Enabling My-account login end

	//Enabling address autocomplete start
	if( $('.location-autocomplete').length > 0) {
		loadGoogle(qg.swe.paths.assets + 'script/qgov-autocomplete-address.js' );
	}
	//Enabling address autocomplete end


}( qg, Modernizr, jQuery ));
