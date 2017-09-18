/*globals jQuery, qg*/
(function( $ ) {
	'use strict';

	// detect IE8, IE6, IE7
	qg.oldIE = true;
	qg.oldIEversion = $( '<div>' ).html( '<!--[if IE 8]><i><![endif]-->' ).find( 'i' ).length ? 8 : $( '<div>' ).html( '<!--[if IE 6]><i><![endif]-->' ).find( 'i' ).length ? 6 : 7;

	// on dom ready
	$(function() {
		//$( document.body ).addClass( 'oldIE' );
        document.documentElement.className += ' ' + 'oldIE';
	});

}( jQuery ));
