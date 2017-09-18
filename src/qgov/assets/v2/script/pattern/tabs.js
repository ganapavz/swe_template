(function( $ ) {
	'use strict';

	// update legacy markup for slidetabs
	var tabs = $( '.compact.tabbed' );
	tabs.removeClass( 'compact tabbed' );
	// each tab panel needs the class 'st_view'
	tabs.find( '.section' ).addClass( 'st_view' );
	tabs.find( '.contents' ).addClass( 'st_view_inner' ).removeClass( 'contents' );

	// create the tabs control bar
	var tabControlBar = $( '<ul class="st_tabs_ul"/>' );
	// add each tab control
	tabs.find( '.st_view' ).each(function() {
		var section = $( this );
		var sectionHeader = section.find( 'h2, .section-header' ).eq( 0 );
		// make sure the section has an id
		section.generateId( 'tab' );
		// create and append a tab link
		tabControlBar.append( '<li><a href="#' + section.attr( 'id' ) + '">' + sectionHeader.text() + '</a></li>' );
		// remove the section header
		sectionHeader.remove();
	});
	// add the tab control bar (with wrapper divs)
	tabs.prepend( tabControlBar
		.wrap( '<div class="st_tabs_wrap"/>' ).parent()
		.wrap( '<div class="st_tabs"/>' ).parent()
	);

	// classes for the overall tab container
	tabs.addClass( 'slidetabs swe-horizontal' );

	// add st_views wrapper class so individual tab containers are within one container wrapper
	tabs.find( '.st_view' ).wrapAll( '<div class="st_views"></div>' );

	// find the id in each section st_view, copy this id into a class on the same div
	tabs.find( '.st_view' ).each(function() {
		var tabID = $( this ).attr( 'id' );
		$( this ).addClass( tabID ).removeAttr( 'id' );
	});
}( jQuery ));


// onready
$(function() {
	'use strict';

	// initialise plugin
	var slideTabs  = $( '#tabs, .slidetabs' );

	if ( slideTabs.length === 0 ) {
		return; // nothing more to do here
	}

	slideTabs = slideTabs.slidetabs({
		externalLinking: true,
		autoHeight: true,
		autoHeightSpeed: 100,
		touchSupport: true,
		tabsShowHash: true,
		responsive: true,
		contentAnim: 'slideH',
		tabsSaveState: true,
		urlLinking: true,
		contentEasing: '',
		tabsEasing: '',
		// used by QldAlert.com
		onContentVisible: function( currentTab ) {
			$( currentTab ).trigger( 'tabactive' );
		}
	});

	// if location has parameter is set, then toggle classes
	if ( window.location.hash ) {
		$( 'a.st_tab', '.st_tabs_wrap' ).each(function( i, a ) {
			if ( a.href.indexOf( window.location.hash ) !== -1 ) {
				slideTabs.goTo( i + 1 );
				return;
			}
		});
	}

	// trigger tabactive on init
	$( '.st_tab_active', '#tabs, .slidetabs' ).trigger( 'tabactive' );

	// recalc layouts
	function fixTabHeight() {
		slideTabs.setContentHeight();
		$( '#tabs, .slidetabs' ).trigger( 'x-height-change' );
	}
	$( 'iframe, img', '#tabs, .slidetabs' ).on( 'load', fixTabHeight );
	$( window ).on( 'scroll', fixTabHeight );

	// fix flickering of height in IE7/8
	var winWidth = $(window).width(),
	    winHeight = $(window).height();

	$(window).resize(function(){
	    var onResize = function(){
	        //window.resize again and it ends in an infinite loop
	        $( window ).trigger( 'resize' );
	    };

	    //New height and width
	    var winNewWidth = $(window).width(),
	        winNewHeight = $(window).height(),
			resizeTimeout = window.setTimeout(onResize, 10);

	    // compare the new height and width with old one
	    if(winWidth!==winNewWidth || winHeight!==winNewHeight)
	    {
	        window.clearTimeout(resizeTimeout);
	    }

	    //Update the width and height
	    winWidth = winNewWidth;
	    winHeight = winNewHeight;
	});

});