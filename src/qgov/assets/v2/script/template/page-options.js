/**
 * This file contains functions used to:
 *    * add "enhancement" pages options that rely on JavaScript
 *    * add a feedback page option (if a feedback form exists)
 *
 * @requires jquery
 */

/*global qg*/
(function( $, qg ) { /* start closure */
    'use strict';
    var feedbackHiddenFields = function () {
        function init () {
            // finding franchise name using the path
            var path = window.location.pathname.replace(/\/$/, '');
            var pathArr = path.split('/').filter(function (e) {
                return e;
            });
            // fields and their values
            var fields = {
                'franchise': pathArr[0],
                'page-title': $(document).find('title').text(),
                'page-url': window.location.href,
                'page-referer': document.referrer,
                'rspUsrAgent': navigator.userAgent
            };
            addHiddenInput(fields);
        }
        //sanitize value to prevent XSS attack
        function sanitize (str) {
            if (!str) {
                return false;
            }
            return str.replace(/</g, '&lt;') // strip <
                .replace(/>/g, '&gt;') // strip >
                .replace(/\+/g, '&#43;') // strip +
                .replace(/\\/g, '&#92;') // strip \
                .replace(/\(/g, '&#40;') // strip (
                .replace(/\)/g, '&#41;') // strip )
                .replace(/{/g, '&#123;') // strip (
                .replace(/}/g, '&#124;'); // strip )
        }
        //adding hidden inputs markup on the page
        function addHiddenInput (obj) {
            $.each(obj, function (key, val) {
                var newHiddenInput = $('<input type="hidden"/>');
                newHiddenInput.attr('name', key);
                newHiddenInput.attr('value', sanitize(val));
                $('#feedback-hidden-inputs').append(newHiddenInput);
            });
        }
        return {
            init : init
        };
    };

    var addArrowId = function () {
        $('#ia > ul').attr('id', 'flex-grid');
    };

    var equalheight = function(container){
        var currentTallest = 0,
            currentRowStart = 0,
            rowDivs = [],
            $el,
            topPosition = 0,
            currentDiv;
        $(container).each(function() {
            $el = $(this);
            $($el).height('auto');
            topPosition = $el.position().top;

            if (currentRowStart !== topPosition) {
                for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
                    rowDivs[currentDiv].height(currentTallest);
                }
                rowDivs.length = 0; // empty the array
                currentRowStart = topPosition;
                currentTallest = $el.height();
                rowDivs.push($el);
            } else {
                rowDivs.push($el);
                currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
            }
            for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
                rowDivs[currentDiv].height(currentTallest);
            }
        });
    };

    var addUrlParameterToShareLinks = function() {
            var url = '';

            if ( $( 'meta[name="DCTERMS.isReplacedBy"]' ).length ) {
                // create a link (get the browser to figure out the absolute URL)
                // http://www.quirksmode.org/bugreports/archives/2005/02/getAttributeHREF_is_always_absolute.html
                url = $( '<a/>' ).attr( 'href', $( 'meta[name="DCTERMS.isReplacedBy"]' ).attr( 'content' ))[ 0 ].href;

            } else if ( /^https:/.test( window.location.href )) {
                url = window.location.href;
            }

            if ( url.length ) {
                $( '.share a', '#post-page-options' ).filter(function() {
                    // ignore links that already have a URL parmeter
                    return ! /[?&]url=/.test( this.href );
                }).each(function() {
                    // append the url parameter to the query string
                    this.href = this.href + '&url=' + encodeURIComponent( url );
                });
            }
        },


        /**
         * If a #page-feedback section exists, add a page option to toggle it's visibility
         */
        addFeedbackOption = function () {

            var feedbackDiv = $('#page-feedback'),
             feedbackBtn = $('#page-feedback-useful');
            if (feedbackDiv.length > 0 && feedbackBtn.length <= 0) {


                // collapse privacy statement (if not IE6)
                if ( ! qg.oldIE || qg.oldIEversion >= 7 ) {
                    $('#page-feedback-privacy').expandableContent();
                }

                // only ask for contact details when customers opt in as research participants
                // if ( $( '#page-feedback-research-opt-in' ).length > 0 ) {
                // 	$( '#feedback-contact' ).relevance( 'relevantWhen', {
                // 		id: 'page-feedback-research-opt-in',
                // 		value: 'Yes'
                // 	});
                // }

                // inject complaints/compliements triage box if not present
                if ( $( '.status.info', feedbackDiv ).length === 0 ) {
                    feedbackDiv.prepend(
                        '<div class="status info">' +
                            '<h2>Feedback on government services, departments and staff</h2>' +
                            '<p>Please use our <a href="https://www.qld.gov.au/contact-us/complaints/">complaints and compliments form</a>.</p>' +
                        '</div>'
                    );
                }

                // inject a triage question re feedback vs complaints
                feedbackDiv.prepend(
                    '<form><ol class="questions"><li><fieldset id="page-feedback-about">' +
                        '<legend><span class="label">Is your feedback about:</span></legend>' +
                        '<ul class="choices">' +
                            '<li>' +
                                '<input type="radio" name="page-feedback-about" value="this website" id="page-feedback-about-this-website" />' +
                                '<label for="page-feedback-about-this-website">this website</label>' +
                            '</li>' +
                            '<li>' +
                                '<input type="radio" name="page-feedback-about" value="a government service" id="page-feedback-about-a-government-service" />' +
                                '<label for="page-feedback-about-a-government-service">a government service, department or staff member?</label>' +
                            '</li>' +
                        '</ul>' +
                    '</fieldset></li></ol></form>'
                );

                // setup relevance on the triage question
                $( '#page-feedback-about' ).delegate( ':radio', 'click', function() {
                    var feedback = this.value === 'this website';
                    if ( feedback ) {
                        var selected = $( '#post-page-options' ).find( 'a.selected' );
                        // select the relevant radio button
                        switch( $( selected ).text() ) {
                            case 'Useful':
                                $( '#page-was-useful-yes' ).attr( 'checked', true );
                                break;
                            case 'Not useful':
                                $( '#page-was-useful-no' ).attr( 'checked', true );
                                break;
                        }
                    }
                    //$( '#post-page-options' ).find( 'a' ).removeClass( 'selected' );
                    //$( '#page-was-useful').find( 'input[name="useful"]').attr( 'checked', false ).removeAttr( 'checked' );
                    $( '.info', feedbackDiv ).relevance( 'relevant', ! feedback );
                    $( '.form', feedbackDiv ).relevance( 'relevant', feedback );
                });

                $( '.info, .form', feedbackDiv ).relevance( 'relevant', false );

                // add default feedback links
                $('#post-page-options > ul').prepend(
                    '<li class="feedback"><a href="#page-feedback" class="button selected" id="page-feedback-useful">Feedback</a></li>'
                );

                // toggle buttons
                $( '#page-was-useful').find( 'input[name="useful"]' ).click( function () {
                    $('#post-page-options').find( 'a').removeClass( 'selected' );
                    // select the relevant radio button
                    switch( $(this).val() ) {
                        case 'yes':
                            $( '#page-feedback-useful' ).addClass( 'selected' );
                            break;
                        case 'no':
                            $( '#page-feedback-not-useful' ).addClass( 'selected' );
                            break;
                    }
                });

                // show feedback section when linking to it
                $('#post-page-options').delegate( 'a[href$=#page-feedback]', 'click', function(e) {
                    // add 'selected' class
                    $('#post-page-options').find( 'a').removeClass( 'selected' );
                    $( this ).addClass( 'selected' );
                    feedbackDiv.relevance( 'relevant', true );
                    // select the relevant radio button
                    switch( $( this ).text() ) {
                        case 'Useful':
                            $( '#page-was-useful-yes' ).click();
                            break;
                        case 'Not useful':
                            $( '#page-was-useful-no' ).click();
                            break;
                    }
                    setWindowScroll();
                    e.preventDefault();
                });
                // allows for hardcoded links in content
                $('#content,#asides').delegate( 'a[href$=#page-feedback]', 'click', function(e) {
                    feedbackDiv.relevance( 'relevant', true );
                    // skip through triage question
                    $( '#page-feedback-about-this-website' ).click();
                    if (!$(this).parents('#post-page-options').length) {
                        setWindowScroll();
                    }
                    e.preventDefault();
                });
                // hide feedback section
                feedbackDiv.relevance( 'relevant', false );
                // changing jsp based url (for Squiz CMS)
                $(feedbackDiv).find('form[action$=".jsp"]').attr('action' , 'https://www.smartservice.qld.gov.au/services/submissions/email/feedback/feedback');
            }

            if (feedbackDiv.length > 0 && feedbackBtn.length > 0) {
                $( '.form', feedbackDiv ).relevance( 'relevant', false );
                $('#post-page-options').delegate( 'a[href$=#page-feedback]', 'click', function(e) {
                    $( '.form', feedbackDiv ).relevance( 'relevant', true );
                    setWindowScroll();
                    e.preventDefault();
                });
            }
        },

        setWindowScroll = function() {
            var feedbackDiv = $('#page-feedback');
            if (feedbackDiv.is(':hidden')) {
                setTimeout(function () {
                    $('html, body').animate({
                        scrollTop: feedbackDiv.offset().top
                    }, 500);
                }, 1000);
            } else {
                $('html, body').animate({
                    scrollTop: feedbackDiv.offset().top
                }, 500);
            }
        }
    ;
    // on ready: enhance page options
    $(function() {

        // if no page options available, exit
        if ($('#pre-page-options, #post-page-options, #page-feedback').length === 0) {
            return;
        }
        //adding hidden inputs in the footer feedback forms
        feedbackHiddenFields().init();
        //adding dynamic is to fix arrow issues
        addArrowId();
        // add URL parameters to share links
        addUrlParameterToShareLinks();
        // Add feedback element option to #post-page-options
        addFeedbackOption();
        // grid equal height
        $(window).load(function () {
            equalheight('.qg-grid .item');
        });
        $(window).resize(function(){
            if($('.qg-grid .item').length > 0){
                equalheight('.qg-grid .item');
            }
        });
    });
}( jQuery, qg )); /* end closure */
