/* globals jQuery, qg, xml2json, routie */
/* jshint expr:true, unused:false */

if (!String.prototype.contains) {
    String.prototype.contains = function (arg) {
        'use strict';
        return !!~this.indexOf(arg);
    };
}

(function( $, swe, routie ) {
    'use strict';

    // On DOMLoad
    $(function() {

        var $content = $( '#emergency-news' );

        // routing: http://projects.jga.me/routie/
        routie({
            '': function() {
                $content.text('root');
            },
            ':slug': function( slug ) {
                $content.html( slug );
                console.log(slug);
            }
        });

        // window.location.hash will be #testing-123
        routie('testing-123');

        // request feed
        $.get('http://api.localhost.dev/assets/feeds/emergency/rss.xml', function(response) {
            var json = $.xml2json(response);
//            console.log( json );
        }).done( function() {
//            console.log( 'second success' );
        }).fail( function () {
//            console.log( 'error' );
        }).always( function () {
//            console.log( 'finished' );
        });

    });

}( jQuery, qg.swe, routie ));
