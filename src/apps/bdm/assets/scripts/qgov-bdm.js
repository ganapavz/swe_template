// QGov integration with BDM application
(function( $ ) {
	'use strict';


	var sectionNavMinHeight = 524,
		updateHeaderBGHeight = function() {

			var $navSection = $( '#nav-section' ),
				$banner = $( '#header-bg' ),
				overlayImageHeight = 9000,
				$pageBg = $( '#page-container .max-width' ),
				navSectionHeight,
				pageBgStart
			;

			// Release the current nav section height (so it can actually be measured reliably)
			$banner.height('auto');

			navSectionHeight = $navSection.length > 0 ? $navSection.offset().top + $navSection.outerHeight( true ) : 0;
			pageBgStart = $pageBg.offset().top;

			// if banner is shorter than the bottom offset of the nav-section
			if ( navSectionHeight >= $banner.outerHeight( true )) {

				$banner.height( navSectionHeight );
				$pageBg.css({
					'background-position': 'left -' + String( overlayImageHeight - navSectionHeight + pageBgStart ) + 'px'
				});

			} else {

				$banner.height( sectionNavMinHeight );
				$pageBg.css({
					'background-position': 'left -' + String( overlayImageHeight - sectionNavMinHeight + pageBgStart ) + 'px' // image is 9000px tall, 524px is the min-height of banner
				});

			}

			// Fix background width for IE6
			if ( $.browser.msie && $.browser.version < 7 ) {
				$banner.width( $( window ).width() );
			}
		}
	;


	// onready
	$(function() {
		var heading = 'Search',
		nav, content, insertPoint;

		// audience tab
		$( '#nav-site .nav-residents' ).addClass( 'current-area' );

		// page headings
		if ( $( 'a.menu_button_selected' ).text() === 'Download Purchased Images' ) {
			heading = 'Download purchased images';
		} else if ( /querySubmit/.test( window.location.href )) {
			heading = 'Results';
		} else if ( /cartRecordSubmit/.test( window.location.href )) {
			heading = 'Order';
		} else if ( /addToCart/.test( window.location.href )) {
			heading = 'Cart';
		} else if ( $( 'a.menu_button_selected' ).text() === 'Tips' ) {
			heading = 'Tips';
			// remove H2
			$( 'h2:contains(Tips)' ).remove();

		} else if ( /Help/.test( $( 'a.menu_button_selected' ).text() )) {
			heading = 'Help';
			// remove H2
			$( 'h2:contains(Help)' ).remove();
		}


		// xhtml skeleton
		$( '.qld_header' ).after($(
			'<div id="page-container"><div class="max-width">' +
				'<div id="content-container">' +
					'<div id="content">' +
						'<div class="article"><div class="box-sizing"><div class="border" id="article">' +
							'<h1>' + heading + '</h1>' +
						'</div></div></div>' +
					'</div>' +
					'<div id="asides"><div class="box-sizing"><div class="border">'+
					'</div></div></div>' +
					'<div id="meta-wrapper"><div class="meta-box-sizing"><div class="border">' +
					'</div></div></div>' +
				'</div>' +

				'<div id="nav-section">'+
					'<div class="box-sizing">'+
						'<h2><a href="https://www.qld.gov.au/law/births-deaths-marriages-and-divorces/family-history-research/">Family history research</a></h2>'+
						'<ul></ul>'+
					'</div>'+
				'</div>'+
			'</div></div>'
		));

		// move breadcrumbs into #page-container
		$( '#breadcrumbs' ).prependTo( '#page-container > .max-width' );

		// move content and nav, use DOM methods to handle nested script with document.write
		nav = $( '.ke_block' ).eq( 0 );
		content = $( '.ke_block' ).eq( 1 );
		document.getElementById( 'article' ).appendChild( content[ 0 ] );
		// if search results
		if ( $( '.ke_search_results' ).length > 0 ) {
			document.getElementById( 'article' ).appendChild( $( '.ke_search_results' )[ 0 ] );
			$( 'table', '#article .ke_search_results' )
				.addClass( 'actions' )
				// move the order buttons to the first column
				.find( 'tr' ).not( '.Cell_Search_Heading' ).find( 'a' ).each(function() {
					var link = $( this );
					link.closest( 'tr' ).find( 'td' ).eq( 0 ).append( link );
					link.wrap( '<em/>' ).addClass( 'button' );
				})
			;
			// last column is now empty, remove cells
			$( 'tr', '#article .ke_search_results' ).each(function() {
				$( this ).find( 'th,td' ).last().remove();
			});
		}

		// move minicart
		$( '#ssq-minicart' ).appendTo( '#asides > .box-sizing > .border' );

		// restructure nav
		nav.find( '.main_menu_buttons a' ).each(function() {
			var li = document.createElement( 'li' );
			$( 'ul', '#nav-section' )[ 0 ].appendChild( li );
			li.appendChild( this );
		});
		if ( $( '.menu_button_selected', '#nav-section' ).length > 0 ) {
			insertPoint = $( '.menu_button_selected', '#nav-section' ).closest( 'li' )[ 0 ].nextSibling;
		} else {
			insertPoint = $( 'li', '#nav-section' )[ 1 ];
		}
		nav.find( '.sub_menu_buttons a' ).each(function() {
			var li = document.createElement( 'li' );
			$( 'ul', '#nav-section' )[ 0 ].insertBefore( li, insertPoint );
			li.appendChild( this );
		});
		nav.remove();


		// 18/06/2013: Inject missing button
		if ( window.location.href === 'https://www.bdm.qld.gov.au/IndexSearch/BirIndexQry.m' ) {
			$( '.ke_welcome' ).last().append( '<p class="actions"><strong><a class="button" href="/IndexSearch/mainMenuSubmit.m?main_menu=IndexSearch">Search historical records now</a></strong></p>' );
		}


		// fix header background and attach to resize handler
		$( window ).resize( updateHeaderBGHeight );
		updateHeaderBGHeight();


		// move page options into meta wrapper
		$( '.meta-box-sizing > .border', '#meta-wrapper' )[ 0 ].appendChild( document.getElementById( 'post-page-options' ));
		$( '.meta-box-sizing > .border', '#meta-wrapper' )[ 0 ].appendChild( document.getElementById( 'page-feedback' ));
		// set title in feedback form hidden field
		$( '#page-title' ).val( document.title );
		// add title and URL to share link URLs
		(function() {
			$( '#post-page-options .share a' ).each(function() {
				// append the title and url parameter to the query string
				this.href = this.href.replace( /([\?&])title=[^&]*&?/, '$1' ) + 'url=' + encodeURIComponent( window.location.href ) + '&title=' + encodeURIComponent( document.title );
			});
		}());

		// remove empty divs?
		$( '.qld_footer' ).prevAll( 'div' ).filter(function() {
			return $.trim( $( this ).text() ).length === 0;
		}).remove();

		// remove empty tables and paragraphs
		$( 'table,p' ).filter(function() {
			return $.trim( $( this ).text() ).length === 0;
		}).remove();


		// nice to have style changes

		// layout tables
		$( 'table', '#article' ).not( '.ke_product_table' ).not(function() {
			return $( this ).parentsUntil( '#article', '.ke_search_results,.ke_welcome' ).length > 0;
		}).addClass( 'layout' );

		// form actions
		$( '.ke_end_buttons, .ke_cart_buttons' ).addClass( 'actions' );
		$( '.ke_end_button' ).addClass( 'button' );
		// put the 'add to basket' button first
		$( '.ke_end_button', '.ke_cart_buttons' ).filter( ':contains(Basket)' ).prependTo( '.ke_cart_buttons' );
		$( '.ke_cart_buttons' ).addClass( 'actions' );
		// primary action
		$( '.ke_end_button' ).eq( 0 ).wrap( '<strong>' );

		// current page indicator
		$( '.menu_button_selected,.sub_menu_button_selected', '#nav-section' ).last().closest( 'li' ).addClass( 'current-page' );

	});


}( jQuery ));
