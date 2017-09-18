/* SSQ minicart UI */

/* global qg, SSQ */
(function( $, qg, SSQ ) {
    'use strict';
    var timeoutLeft;

    // var SSQ = SSQ || {};
    // SSQ.common = SSQ.common || {};

    /**
     * Calculates line item cost, gst, totals, and returns them as jQuery DOM.
     *
     * @param cart The JSON evaluated cart contents.
     */
    var getLineItemsAndTotals = function(cart) {
        var total = 0;
        var totalGst = 0;

        // render total number of products in cart
        var itemCount = 0;
        for (var i = 0; i < cart.products.length; i++) {
            itemCount += cart.products[i].quantity;
        }

        var HTMLcart = $( '<table>'+
            '<caption><span id="ssq-total-items">' + itemCount + '</span> item' + (itemCount === 1 ? '' : 's' ) + ' in cart: <span class="total"></span></caption>'+
            '<tfoot></tfoot>'+
            '<tbody></tbody></table>' );

        // cents to currency conversion
        // TODO move this to var toCurrency ?
        // TODO can "cents" (Integer) -> currency formatted string be done with regex alone??  
        var toCurrency = function(amountInCents) {
            var cents = amountInCents % 100;
            return '$' + Math.floor(amountInCents/100).toString().replace(/(?=(\d{3})+$)\B/g,',' ) + (cents < 10 ? '.0' : '.' ) + cents;
        };
        
        // create column headers in cart
        $(HTMLcart).append( '<tr><th scope="col">Item</th><th class="number">Qty</th><th class="number">Amount</th></tr>' );
         
        // render product name and cost details
        for (i = 0; i < cart.products.length; i++) {
            var product = cart.products[i];

            $(HTMLcart).append( '<tr><td scope="row">' + product.title + '</td>' +
                               '<td class="number">' + product.quantity + '</td>' +
                               '<td class="number">' + toCurrency((product.cost + product.gst) * product.quantity) + '</td></tr>' );
            total += (product.cost + product.gst) * product.quantity;
            totalGst += product.gst * product.quantity;
        }

        // render delivery details
        for (i = 0; i < cart.delivery.length; i++) {
            var item = cart.delivery[i];

            $(HTMLcart).append( '<tr><td scope="row" class="ssq-delivery-desc">' + item.description + '</td>' +
                               '<td class="number">' + item.quantity + '</td>' +
                               '<td class="number">' + toCurrency(item.cost + item.gst) + '</td></tr>' );
            total += item.cost + item.gst;
            totalGst += item.gst;
        }

        total = toCurrency(total);
        totalGst = toCurrency(totalGst);

        // totals line
        $(HTMLcart).find( 'caption .total' ).append(total);
        $(HTMLcart).find( 'tbody tr:nth-child(odd)' ).addClass( 'alternate' );
        $(HTMLcart).find( 'tfoot' ).append( '<tr><th colspan="2" scope="row">Total (incl. GST):</th><td id="ssq-minicart-total" class="number">' + total + '</td></tr>' ).append( '<tr class="gst"><th colspan="2" scope="row">Total GST amount:</th><td id="ssq-minicart-totalgst" class="number">' + totalGst + '</td></tr>' );
        $(HTMLcart).find( 'tfoot' ).append( '<tr class="timeout"><th colspan="3" scope="row">' + createTimeOutHTML() +  '</th></tr>' );
        return $( '<div class="ssq-minicart-items"></div>' ).append(HTMLcart);
    };

    var createTimeOutHTML = function() {
        if (SSQ.cart.containsItemWithTimeout) {
            return (
                '<span id="timeout">You need to pay by <strong>' +
                SSQ.cart.timeOutAt +
                '</strong></span><br/>' +
                '<span id="timeLeft"><small>' +
                '</small></span>'
            );
        } else {
            return '';
        }
    };

    /**
     * Creates minicart HTML
     */
    var createMiniCartCardsHTML = function() {
        if (SSQ.cart.extendedPaymentOptions && !SSQ.cart.containsLimitedItems) {
            return (
                '<h4>Cards accepted across government</h4>' +
                '<ul>' +
                    '<li><img src="' + SSQ.cart.baseURI + '/minicart/visa.png" alt="Visa" /></li> ' +
                    '<li><img src="' + SSQ.cart.baseURI + '/minicart/mastercard.png" alt="MasterCard" /></li> ' +
                '</ul>' +
                '<h4>Other cards accepted for this service</h4>' +
                '<ul>' +
                    '<li><img src="' + SSQ.cart.baseURI + '/minicart/amex.png" alt="American Express" /></li> ' +
                    '<li><img src="' + SSQ.cart.baseURI + '/minicart/diners.png" alt="Diners Club" /></li> ' +
                '</ul>'
            );
        } else {
            return (
                '<h3>Cards accepted</h3>' +
                '<ul>' +
                    '<li><img src="' + SSQ.cart.baseURI + '/minicart/visa.png" alt="Visa" /></li> ' +
                    '<li><img src="' + SSQ.cart.baseURI + '/minicart/mastercard.png" alt="MasterCard" /></li> ' +
                '</ul>'
            );
        }
    };

    var createMiniCartWarningHTML = function() {
        if ( SSQ.cart.limitedPaymentOptions && SSQ.cart.containsExtendedItems) {
            return (
                '<div class="ssq-minicart-warning">' +
                    '<em>Alert:</em> This service does not support AMEX or Diners payment.' +
                '</div>'
            );
        } else {
            return '';
        }

    };

    var createMiniCartHTML = function() {
        return $(
            '<div id="ssq-minicart">' +
                '<h2>Cart</h2>' +
                '<div id="ssq-minicart-view"> ' +
                    '<div class="ssq-minicart-submit">' +
                        '<input type="hidden" id="ssq-cart-contents" name="ssq-cart-contents" value="" />' +
                        '<a href="' + SSQ.cart.baseURI + '/cart/checkout" id="ssq-cart-checkout"><img id="ssq_minicart_checkout" src="' + SSQ.cart.baseURI + '/minicart/btn-checkout.png" alt="Checkout" /></a> ' +
                        '<a href="' + SSQ.cart.baseURI + '/cart/' + SSQ.cart.id + '/view" id="ssq-cart-edit"><img id="ssq_minicart_cart" src="' + SSQ.cart.baseURI + '/minicart/btn-cart.png" alt="Edit cart" /></a> ' +
                    '</div>' +
                '</div>' +
                '<div class="ssq-minicart-cards">' +
                    createMiniCartCardsHTML() +
                    createMiniCartWarningHTML() +
                '</div>' +
            '</div>'
        );
    };

    /**
     * Returns true if cookies are supported
     * Relies on user accepting test cookie
     */
    var areCookiesDisabled = function() {
        var testCookie = '-areCookiesSupported=yes';
        document.cookie = testCookie;
        var index = document.cookie.indexOf(testCookie);

        // delete cookie
        var d = new Date();
        d.setFullYear(d.getFullYear()-1);
        document.cookie = testCookie + '; expires=' + d.toGMTString();

        return index < 0;
    };


    /**
     * Inserts contents read from base page into minicart.
     *
     * @param contents Contents of the cart as json
     */
    var insertCartContents = function(cart) {
        // check for existing cart in DOM
        var minicart = $( '#ssq-minicart' );
        
        // need to create a cart UI?
        if (!minicart.length || minicart.hasClass( 'placeholder' )) {
            minicart = createMiniCartHTML();
            minicart.hide();
            // insert into page
            var insertPoint = $( '#ssq-minicart.placeholder, #ssq-minicart-placeholder' ).eq(0);
            if (insertPoint.length) {
                insertPoint.replaceWith(minicart);
            } else {
                insertPoint = $( '#feature, #content' ).add( 'body' ).eq(0);
                insertPoint.append(minicart);
            }
        }

        // apply corners for IE
        if ( qg.oldIE ) {
            // top right and left
            minicart
            .add( '#ssq-minicart-view' )
                .css({position: 'relative', zoom: '1'})
                .prepend( '<span class="borderRadius topRight"></span>' )
                .prepend( '<span class="borderRadius topLeft"></span>' )
            .end()
                .append( '<span class="borderRadius bottomRight"></span>' )
                .append( '<span class="borderRadius bottomLeft"></span>' );
        }

        // get cart contents
        var contents;
        // is cart empty?
        if (cart.products.length > 0) {
            contents = getLineItemsAndTotals(cart);
        } else {
            if (areCookiesDisabled()) {
                minicart.addClass( 'fail' ).find( 'h2' ).eq(0).append( ' disabled' );
                contents = $( '<div class="ssq-minicart-error"><br/><h2>Requires cookies</h2><p>Please enable <strong>third-party cookies</strong> for the domain www.smartservice.qld.gov.au and reload this page. Find help with cookies in your browser\'s help.</p><p><small>We use cookies to track what you put into your shopping cart. These cookies do not contain personal information.<br />View our <a href="https://www.qld.gov.au/legal/privacy/">privacy statement</a>.</small></p></div>' );
            } else {
                contents = $( '<div class="ssq-minicart-empty"><p>Your cart is empty.</p></div>' );
            }
            // remove submit buttons
            $( '.ssq-minicart-submit', minicart).remove();
        }
        // remove placeholder sections
        $( '#ssq-minicart .ssq-minicart-noscript, #ssq-minicart .ssq-minicart-empty, #ssq-minicart .ssq-minicart-items' ).remove();
        // insert cart contents

        $( '#ssq-minicart-view' ).prepend(contents.fadeIn(1800));

        if (SSQ.cart.outageMessage) {
            $( '#ssq-minicart-view' ).prepend( '<div class="ssq-minicart-info"><p>' + SSQ.cart.outageMessage + '</p></div>' );
            minicart.addClass( 'info' );
        }

        minicart.show();
    };

    function countdown() {
        var left = parseInt(timeoutLeft,10);
        var hoursLeft = (left - left % 3600) / 3600;
        left = left - (hoursLeft * 3600);
        var secondsLeft = left % 60;
        var minutesLeft = (left - secondsLeft) / 60;

        var time = '( ';
        if (hoursLeft > 0) {
            time = time + hoursLeft  + ' hours, ';
        }

        if (minutesLeft > 0) {
            time = time + minutesLeft  + ' minutes';
            if(hoursLeft < 1){
                time = time + ',';
            }
            time = time + ' ';
        }
        if (hoursLeft < 1) {
            time = time + secondsLeft % 60  + ' seconds ';
        }
        time = time + 'remaining)';

        if (timeoutLeft === 60) {
            time = '(60 seconds remaining)';
        }

        if (timeoutLeft <= 0) {
            time = '(0 seconds remaining)';
        }

        if (left === 0) {
            location.reload();
        }
        document.getElementById( 'timeLeft' ).innerHTML = time;

        timeoutLeft--;
    }

    if (SSQ.cart.containsItemWithTimeout) {
        timeoutLeft = SSQ.cart.timeOutLeft;
        setInterval(countdown, 1000);
    }
    // render minicart
    if (SSQ.cart) {
        insertCartContents(SSQ.cart.content);
    }
    
}( jQuery, qg, SSQ ));