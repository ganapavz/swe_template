/**
 * ARIA labelledBy
 * Use to easily add relationships between page sections and label text/headings.
 * (Automatically adds ids to elements that don't have them).
 * @version 0.2
 * 
 * @author Andrew Ramsden
 * @see http://irama.org/web/dhtml/aria/labelledby/
 * @license Common Public License Version 1.0 <http://www.opensource.org/licenses/cpl1.0.txt>
 * @requires jQuery (tested with version 1.4.2) <http://jquery.com/>
 * @requires jQuery jARIA plugin <http://outstandingelephant.com/jaria/>
 * @required jQuery.generateId() <https://github.com/Forces/Generate-ID>
 * 
 * Example use: $('#section').labelledBy('h2'); // #section is labelledby the first h2 within
 */

(function( $ ) { /* start closure */
	'use strict';


	// jQuery plugin
	$.fn.labelledBy = function( labelledBySelector ) {
		return this.each(function() {
			var $this = $( this ),
				label = $this.find( labelledBySelector )
			;

			if ( label.length === 0 ) {
				label = $( labelledBySelector );
			}
			if ( label.length === 0 ) {
				// skip, no matching elements to be the label
				return;
			}

			$this.ariaState( 'labelledBy', label.first().generateId( 'landmark-label' ).attr( 'id' ));
		});
	};


}( jQuery )); /* end closure */
