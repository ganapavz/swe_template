/**
 * Flowt
 * Supports floating an image with a caption the width of the image
 *
 * Relies on markup (configurable):
 * <div class="figure">
 *     <img src="image-here.jpg" alt="Alt text here" />
 *     <div class="figcaption">Caption here</div>
 * </div>
 * 
 * @version 0.1
 * Changelog:
 *   * 0.1 Initial implementation.
 * 
 * @since 01/12/2010
 * @author Andrew Ramsden <http://irama.org/>
 * @see http://irama.org/web/dhtml/flowt/
 * @license Common Public License Version 1.0 <http://www.opensource.org/licenses/cpl1.0.txt>
 * @requires jQuery (tested with 1.4.4) <http://jquery.com/>
 * TODO does this require ResizeEvents too?
 */
 
(function( $, ResizeEvents ) {// start closure
	'use strict';
	
	/* start config */
	$.flowt = {};

	$.flowt.defaultOptions = {
		containerClass  : 'figure',
		captionSelector : '.figcaption',
		activeClass     : 'figure-active'
	};

	$.flowt.conf = {};
	/* end config */


	var updateFlowt = function() {
			
		var $this = $( this ),

			options = $this.data( 'flowt' ),

		// Is there room for the image?
			maxWidth = $this.parent().width(),
			origWidth = $this.data( 'original-width' );
		

		// loosen restriction on width so parent can be measured accurately in IE6
			$this.width( '100%' );
		
			// console.log($this, 'o: '+origWidth+' - m:'+maxWidth);
			
			if ( origWidth <= maxWidth ) {
				
				// Set container and caption to original width
				$this.width( origWidth );
				$this.find( options.captionSelector ).eq( 0 ).setInnerWidth( origWidth );
				
			} else {
				
				// Leave container width at 100% and caption to equal it
				$this.find( options.captionSelector ).eq( 0 ).setInnerWidth( $this.width() );
			}
		
	},


	updateFlowts = function( flowtSelector ) {
		// console.log(flowtSelector);
		$( flowtSelector ).each( updateFlowt );
	},


	initFlowt = function( options ) {
		// Merge runtime options with defaults
		// Note: The first argument sent to extend is an empty object to
		// prevent extend from overriding the default $.expContent.defaultOptions object.
			options = ( typeof options === 'undefined' )
				? $.flowt.defaultOptions
				: $.extend( {}, $.flowt.defaultOptions, options )
			;

			var $this = $( this ),

				testImage = document.createElement( 'img' ),

				origWidth;

			// find width of image
				testImage.src = $this.find( 'img' ).attr( 'src' );
				origWidth = testImage.width;

		// store data
			$this.data( 'flowt', options );
		
		// apply width to container (and caption)
			$this
				.width( origWidth )
				.data( 'original-width', origWidth )
				.addClass( options.activeClass )
			;
			//$this.find(options.captionSelector).eq(0).setInnerWidth(origWidth);
		// set width 100% on image
			$this.find( 'img' ).eq( 0 ).width( '100%' );
		
		updateFlowt.call( this );
	},
	

	recalcFlowts = function() {
		var flowts = $( document.body ).data( 'flowt' );

		if ( flowts !== undefined ) {
			$.each( flowts, function( key, value ) {
				updateFlowts( value );
			});
		}
	};
	

	$( document.body ).data( 'flowt', [] );
	
	
	$.fn.flowt = function( options ) {
		options = options || {};
		
		var flowts = $( document.body ).data( 'flowt' );
		
		//flowts[ flowts.length ] = $this.selector;
		//$( document.body ).data( 'flowt', flowts );
		
		
		this.each(function() {
			/* Don't initialise more than once */
			if ( $( this ).is( '.' + $.flowt.conf.activeClass )) {
				return;
			}
			
			flowts[ flowts.length ] = this.selector;
			initFlowt.call( this, options );
		});
		
		$( document.body ).data( 'flowt', flowts );
		
		return this;
	};
	
	
	/*
	 * Sets the width of an element minus the current width of padding and borders on that element.
	 * This way the new width() of the element will exactly match the OuterWidth specified
	 * (regardless of padding/border etc).
	 */
	$.fn.setInnerWidth = function( newInnerWidth ) {

		var offset = this.innerWidth() - this.width();
		
		//console.log(newInnerWidth - offset);
		
		this.width( newInnerWidth - offset );
		
		return this; // facilitate chaining
	};


	//$.debug(ResizeEvents);
	if ( typeof ResizeEvents !== 'undefined' ) {
		ResizeEvents.bind( 'x-window-width-resize x-text-resize', recalcFlowts );
	}
	//$(window).resize(recalcFlowts);
	
	
}( jQuery, ResizeEvents )); /* end closure */
