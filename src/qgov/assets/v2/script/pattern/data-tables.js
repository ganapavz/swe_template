(function( $ ) {
	'use strict';

	var $dtables = $( '.data-table' );
	if ( $dtables.length ) {
		$( '.even, .odd', '.data-table' ).removeClass( 'even odd' );
		$dtables.dataTable({
			asStripeClasses: ['even', 'odd']
		});
	}
}( jQuery ));