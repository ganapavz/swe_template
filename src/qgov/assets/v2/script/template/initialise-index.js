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

/* globals qg */
// onready
jQuery(function( $ ) { /* start closure */
    'use strict';

    /* Markup enhancements */

    // Initialise slideshows
    // Options
    var slideshowOptions = {
        type                  : 'slideshow',
        controlsPosition      : 'after',
        slideshowInterval     : 8000,
        variableHeight        : false,
        slideshowAutoStart    : true,
        rememberStateInCookie : false,
        supportCSSImgReplace  : true,
        clearPixelImg         : qg.swe.paths.assets + 'images/ui/displacement.png'
    };

    // only initialise slideshow if there's more than one featured item
    if ( $( 'body.home' ).length === 0 && $( '.news-items .section' ).length > 1 ) {
        $( '.news-items' ).compact( slideshowOptions );
    }

    /* Content enhancements */

    /* Stripe events and your-say lists */
    // $( 'li', '#asides .events, #related-promotions .your-say, #related-promotions .events' ).filter( ':odd' ).addClass( 'even' );

    // Flex grid for index pages
    var iaFlexGridOptions = {
        selector: 'li',
        inner: true
    };
    //$( '#ia > ul > li, #ia > .section > ul > li' ).wrapInner( '<div class="inner" />' );
    $( '#ia > ul' ).flexGrid( iaFlexGridOptions );
    $( '#ia > ul' ).find( 'li' ).filter(function() {
        return $( this ).find( 'a' ).length === 1;
    }).linkedUp();
    $( '#ia > #section-about > ul' ).flexGrid( iaFlexGridOptions );
    $( '#ia > #section-for > ul' ).flexGrid( iaFlexGridOptions );
    var onResizeIA = function () {
        $( '#ia > ul' ).flexGrid().reset();
        $( '#ia > #section-about > ul' ).flexGrid().reset();
        $( '#ia > #section-for > ul' ).flexGrid().reset();
    };
    $(window).smartresize( onResizeIA );

    // grid layout for related promotions / latest updates
    (function() {
        var $promos = $( '#related-promotions, #ia-updates' ),
            imagesLoading = $promos.find( 'img' ).filter(function() {
                return this.height === 0;
            });

        // have all the images loaded?
        if ( imagesLoading.length === 0 ) {
            // initialise now
            $promos.each(function () {
                $(this).flexGrid({
                    selector: 'div'
                });
            });
        } else {
            // init onload of last image
            imagesLoading.eq( -1 ).bind( 'load', function() {
                //promos.flexGrid( 'div' ).trigger( 'x-initial-sizes' );
                $promos.each(function () {
                    $(this).flexGrid({
                        selector: 'div'
                    });
                }).trigger( 'x-initial-sizes' );
            });
        }
        var onResizePromos = function () {
            $promos.each(function () {
                $(this).flexGrid().reset();
            });
        };
        $(window).smartresize(onResizePromos);
    }());


    $( '#ia-updates' ).compact({ variableHeight: true });

    /* script to run unordered lists layout reset */

    if( $( 'body' ).hasClass( 'home' ) && $('.sections').length ) {
        var $sections = $('.sections');
        $sections.each(function (key) {
            $(this).sectionRunner({
                key: key,
                grouping: 3,                // the grouping for responsive view (default is 3)
                fluid: true                 // the trigger for fluid width
            });
        });
        var onResizeAsides = function () {
            $sections.each(function () {
                $(this).sectionRunner().setResize();
            });
        };
        $(window).smartresize(onResizeAsides);
    }

    /* script to run sliding content panels */

    if( ($( 'body' ).hasClass( 'home' ) || $( 'body').hasClass( 'franchise-index-with-asides' )) && $('.slide-runner').length ) {
        var $slides = $( '.slide-runner' );
        $slides.each(function( key ) {
            var slide = $( this );
            var autoplayEnabled = ! slide.hasClass( 'autoplay-disabled' );
            slide.slideRunner({
                key: key,
                grouping: 3,               // the grouping for responsive view (default is 3)
                timeout: 6,                // the timeout for autoplay (in seconds)
                easing: 'linear',          // the easing setting (jQuery easing plugin)
                controlsPosition: 'above', // the position of the controls (above or below)
                autoplay: autoplayEnabled, // the trigger for autoplay
                fluid: true                // the trigger for fluid width
            });
        });
        var onResizeSlides = function() {
            $slides.each(function() {
                $( this ).slideRunner().setResize();
            });
        };
        $( window ).smartresize( onResizeSlides );
    }

}); /* end closure */
