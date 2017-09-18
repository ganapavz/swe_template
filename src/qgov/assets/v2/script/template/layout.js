/**
 * Layout manager
 *
 * sets classes on document.body when layout changes
 *
 * @requires jquery
 * @requires ResizeEvents
 */

/*global qg, ResizeEvents*/
/* jshint unused:false, sub:true, expr:true */

(function( $, ResizeEvents ) { /* start closure */
	'use strict';

	var widgets = [],
        oldColumns = 0,
		logo = $( 'img', '#qg-coa' ).eq( 0 ),
		$toolsLinks = $( '#tools > li' ).not( '#header-search' ),
		$widgetMyaccountLogin = $('.qg-avatar-container'),
		$mobileTools = $( '<ul id="ui-controls"><li class="tools-button"><a href="#header-search" id="show-search">Show search</a></li><li class="tools-button"><a href="#nav-site" id="show-menu">Show menu</a></li></ul>'),
        $cartControls = $( '<ul id="cart-controls"></ul>'),
        $controlUser = $( '<li class="tools-button"><a href="#widget-user" id="show-login">Show login</a></li>' ),
        $controlCart = $( '<li class="tools-button"><a href="#widget-cart" id="show-cart">Show cart</a></li>' ),
        $cartWidgets = $( '<div id="cart-widgets"></div>'),
        $widgetUser = $( '<div id="widget-user" class="slideUp"></div>' ),
        $widgetCart = $( '<div id="widget-cart" class="slideUp"></div>' ),
        $asides = $( '#asides' ),
        $miniCart = $asides.find( '.minicart' ),
        $userlogin = $asides.find( '.user-login' )
    ;

    // set the widgets into an array
    widgets[$miniCart.index()] = $miniCart;
    widgets[$userlogin.index()] = $userlogin;
    widgets.reverse();

	// oldIE : do nothing
	if ( qg.oldIE ) {
		qg.swe.isMobile = false;
		qg.swe.isTablet = false;
		return;
	}

	// duplicate contact us link into footer
	$( 'ul', '#footer' ).last().prepend( $( '.nav-contact', '#tools' ).clone() );

	// remove search if site does not have search
	if ( $( '#header-search' ).length === 0 ) {
		$mobileTools.find( 'li' ).eq( 0 ).remove();
	}

	// progressive disclosure for search/nav on mobile
	$( '#header, #banner' ).delegate( '.tools-button a', 'click', function( event ) {
		event.preventDefault();

		var button = $( this ),
			target = $( button.attr( 'href' )),
			targetHidden = target.hasClass( 'slideUp' )
			;

		button.toggleClass( 'active' );

		// on mobile, control breadcrumbs with site nav
		if ( qg.swe.isMobile && target.attr( 'id' ) === 'nav-site' ) {
			target = target.add( '#breadcrumbs' );
		}

		// control focus
		if ( targetHidden ) {
			$( 'a', target ).removeAttr( 'tabindex' );
			$( 'input', target ).removeAttr( 'disabled' );
			target.removeClass( 'slideUp' );
			//target.find( '#search-query' ).focus();
		} else {
			if ( target.find( '#search-query' ).is( ':focus' )) {
				// shift focus to button
				button.focus();
			}
			target.addClass( 'slideUp' );
			$( 'input', target ).attr( 'disabled', true );
			$( 'a', target ).attr( 'tabindex', -1 );
		}

	});

	// adaptable layout
	var layoutManager = function() {
		var columns, formWidth;

		columns = $( '#qg-coa,#qg-logo' ).height() < 42 ? 1 :
			$( '#header' ).offset().left === $( '.max-width', '#header' ).eq( 0 ).offset().left ? 2 : 3;

		// did columns change?
		if ( columns === oldColumns ) {
			// no change, get out of here
			return;
		} else {
			// track and continue
			oldColumns = columns;
		}

		// mobile (simplified IA)
		if ( columns === 1 ) {
			qg.swe.isMobile = true;
			// switch to stacked logo
			if ( /qg-coa\.svg$/.test( logo.attr( 'src' ))) {
				logo.attr( 'src', logo.attr( 'src' ).replace( 'qg-coa.svg', 'qg-coa-stacked.svg' ));
			}

			$( '#breadcrumbs' )
				.addClass( 'slideUp' )
				// set things a block display (triggers slideUp properly)
				.css( 'display', 'block' )
				.find( 'input' ).attr( 'disabled', true )
				.end()
				.find( 'a' ).attr( 'tabindex', -1 )
			;

			// hide IA
			$( 'ul, p', '#ia .d1' ).hide( 0 );
			// if #ia has no visible links, turn it into a button to show contents
			$( '.d1', '#ia' )
				.filter(function() {
					var links = $( 'a', this );
					// if no visible links, need to reveal links on click
					return links.filter( ':visible' ).length < 1;
				})
				.find( 'h2' )
					.wrapInner( '<button/>' )
					.children()
						.unwrap()
						.parent()
							.filter(function() {
								// a single link is handled by .linkedUp()
								return $( 'a', this ).length !== 1;
							})
								.bind( 'click', function() {
									$( 'ul, p', this ).slideToggle( 300 );
								})
								.find( 'button' )
									.addClass( 'submenu' )
			;

		} else {
			qg.swe.isMobile = false;
			// switch to regular logo
			if ( /qg-coa-stacked\.svg$/.test( logo.attr( 'src' ))) {
				logo.attr( 'src', logo.attr( 'src' ).replace( 'qg-coa-stacked.svg', 'qg-coa.svg' ));
			}

            // prepend widgets (in reverse)
            $.each( widgets, function( key, obj ) {
                $asides.prepend( $(obj) );
            });
            $( '#cart-controls').remove();
            $( '#cart-widgets').remove();

			$( '#breadcrumbs' )
			    .find( 'a,input')
				    .removeAttr( 'tabindex' )
				    .removeAttr( 'disabled' )
			    .end()
			    .removeClass( 'slideUp' )
			;

			// show IA
			$( 'ul, p', '#ia' ).show( 0 );

			// remove highlighted IA and 'more' button, if present
			$( '#ia > button' ).add( '#ia .highlight' ).remove();
			// convert buttons to h2
			$( 'button', '#ia' ).wrapInner( '<h2/>' ).children().unwrap();
		}

		// mobile AND tablet (compressed header)
		if ( columns < 3 ) {
			qg.swe.isTablet = ! qg.swe.isMobile;

            // add cart/user if qgov-cart class is set on body tag
            if ( !!$miniCart.length || !!$userlogin.length) {
                $( '#tools' ).after( $cartControls );
                $( '#breadcrumbs' ).before( $cartWidgets );
                if (!!$miniCart.length) {
                    $( $cartControls ).append( $controlCart );
                    $( $cartWidgets ).append( $widgetCart );
                    $( $widgetCart ).append( $miniCart );
                }
                if (!!$userlogin.length) {
                    $( $cartControls ).append( $controlUser );
                    $( $cartWidgets).append( $widgetUser );
                    $( $widgetUser ).append( $userlogin );
                }
            }

			// mobile: progressive disclosure for search and nav
			$toolsLinks.appendTo( $( '#nav-site ul' ).eq( 0 ));
			if ( $( '#tools' ).length > 0 ) {
				$mobileTools.insertBefore( '#tools' );
			} else if ( $( '#banner' ).length > 0 ) {
				$mobileTools.appendTo( '#banner' );
			} else {
				$( '#qg-coa,#qg-logo' ).eq( 0 ).after( $mobileTools );
			}
			// change login button position in mobile view
			$('#ui-controls #show-menu').parent().before($widgetMyaccountLogin);

			$( '#header-search, #nav-site' )
				.addClass( 'slideUp' )
				.find( 'input' ).attr( 'disabled', true )
				.end()
				.find( 'a' ).attr( 'tabindex', -1 )
			;

			// set things a block display (triggers slideUp properly)
			$( '#tools, #nav-site').show();

			// add process menu under h1
			var process; //back, forward;

			if ( $( '.has-submenu' ).length > 0 ) {
                // remove process menu
                $( '#nav-process' ).remove();

				// define main process wrapper
				process = $( '<div id="nav-process"><div class="box-sizing"><div class="nav-wrapper"><div class="nav"><ul class="cf"><li></li></ul></div></div></div></div>' );

				// populate process menu div with html from the nav-section (grab the entire OL)
				$( '#nav-section ol' ).eq(0).clone().appendTo( process.find( 'li' ));

				// add dropdown menu with appropriate page numbers in steps
				$( '<a class="dropdown" href="#"></a>' )
				.text( 'Step ' + process.find( '.current .page-number' ).text() + ' of ' + process.find( '.page-number' ).eq(-1).text() )
				.prependTo( process.find( 'ul > li' ));

				// insert in page
				process.hide( 0 );
				$( 'h1' ).eq( 0 ).after( process );

				$( '#nav-process li:has(ol)' ).doubleTapToGo();
			}

			// fix size on select
			formWidth = $( '.form, form, .article', '#content' ).width();
			$( 'input, select, textarea', '#content' ).each(function() {
				var select = $( this );
				if ( select.width() > formWidth ) {
					// cap it at 80%
					select.width( formWidth * 0.8 );
				}
			});

		} else {
			qg.swe.isTablet = false;

			// undo progressive disclosure for search and nav
			$( '#header-search, #nav-site' )
			.find( 'a,input')
				.removeAttr( 'tabindex' )
				.removeAttr( 'disabled' )
			.end()
			.removeClass( 'slideUp' )
			;
			$mobileTools.remove();
			$toolsLinks.prependTo( $( '#tools' ).eq( 0 ));

			// remove menu button
			$( '.menu', '#header' ).remove();

			// remove process menu
			$( '#nav-process' ).remove();
		}
		
	};

	// on width change
	ResizeEvents.bind( 'x-initial-sizes x-window-width-resize', layoutManager );


}( jQuery, ResizeEvents )); /* end closure */
