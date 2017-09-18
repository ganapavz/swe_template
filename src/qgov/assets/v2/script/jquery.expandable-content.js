/**
 * Expandable content
 * Unobtrusive DHTML clickey-hidey content sections (based on 'more information' plugin <http://irama.org/web/dhtml/more-info/>).
 * 
 * @version 0.2
 * Changelog:
 *   * 0.1 Initial implementation.
 *   * 0.2 Added more specific selection of expandable section, and ensure widget is never initialised more than once. 
 * 
 * @since 11/02/2008
 * @author Andrew Ramsden <http://irama.org/>
 * @see http://irama.org/web/dhtml/expandable/
 * @license Common Public License Version 1.0 <http://www.opensource.org/licenses/cpl1.0.txt>
 * @requires jQuery (tested with 1.4.3) <http://jquery.com/>
 */
 

/* start config */
jQuery.expContent = {};

jQuery.expContent.defaultOptions = {
	linkText : '' // Use the first heading found as link text if none provided here
};

jQuery.expContent.conf = {
	expandableClass : 'expandable',
	toggleClass     : 'expandable-toggle',
	activeClass     : 'expandable-active',
    openClass       : 'open',
	hideText        : 'Hide'
};
/* end config */


(function($) {// start closure

	$(document).ready(function() {
		// initialise .expandable elements by default
		$('.'+$.expContent.conf.expandableClass).expandableContent();
	});
	
	
	$.fn.expandableContent = function (options) {
		options = options || {};
		
		$(this).each(function () {
			if ($(this).is('.'+$.expContent.conf.activeClass)) { /* Don't initialise more than once */
				return;
			}
			initExpandContent.apply(this, [options]);
		});
		
		return $(this); // facilitate chaining
	};
	
	
	initExpandContent = function (options) {
			// Merge runtime options with defaults
			// Note: The first argument sent to extend is an empty object to
			// prevent extend from overriding the default $.expContent.defaultOptions object.
				options = (typeof options == 'undefined')
					? $.expContent.defaultOptions
					: $.extend({}, $.expContent.defaultOptions, options)
				;
				$(this).data('options', options);
			
			
			linkText = (options.linkText != '')? options.linkText : $(this).firstHeading().text() ;
			if (linkText == '') {
				// Report why this failed
					$.debug && $.debug('Could not initialise expandable content for #'+$(this).generateId().attr( 'id' )+' - options.linkText was empty and no heading could be found. One of these is required to populat the expandable link text.');
				// Bail
					return false;
			}
			
			// Initialise
				$(this)
					.hide()
					.addClass($.expContent.conf.activeClass)
					.before(toggle = $('<a href="#'+$(this).generateId().attr( 'id' )+'" class="'+$.expContent.conf.toggleClass+'">'+linkText+'</a>'))
				;
				toggle
					// .toggle(showExpContent, hideExpContent)
					.click( toggleExpContent )
				;
			
	};
	

	showExpContent = function () {
		$(this)
			.attr('title', $.expContent.conf.hideText+' "'+$(this).text()+'"')
			.nextAll('.expandable-active:first').stop().height('auto').slideDown(function(){
				$( this )
					.addClass($.expContent.conf.openClass)
					.trigger('x-height-change')
				;
			})
		;
		return false;
	};
	
	hideExpContent = function () {
		$(this)
			.attr('title', $(this).text())
			.nextAll('.expandable-active:first').stop().height('auto').slideUp(function(){
				$( this )
					.removeClass($.expContent.conf.openClass)
					.trigger('x-height-change')
				;
			})
		;
		return false;
	};
	
	toggleExpContent = function() {
		var target = $( this ),
		    toggleState = target.data( 'expandable-content.toggle' ) || false,
		    toggleFunc = toggleState === true ? hideExpContent : showExpContent
		;

		toggleFunc.call( this );
		target.data( 'expandable-content.toggle', ! toggleState );
	};

	
	/**
	 * Get the the first and biggest heading inside the current element
	 * @version 3.3
	 * @author Andrew Ramsden <irama.org>
	 * @return jQueryNode The first and biggest heading within the target element,
	 *         or a blank h2 if no headings found.
	 */
	$.fn.firstHeading = function(includeAllDescendants) {
		includeAllDescendants = includeAllDescendants||false;
		
		// @since 3.0: Discovered that jQuery returns nodes in selector order, not DOM order,
		//             which means, this can all be shortened to one line...
		headingSelector = 'h1:first, h2:first, h3:first, h4:first, h5:first, h6:first';
		
		// @since 3.2: Support added for fieldset/legend combo
		if ($(this).is('fieldset')) {
			headingSelector = 'legend:first, '+headingSelector;
		}
		
		// @since 3.1: Can specify whether to include all descendants (true) or just direct 
		//             children headings (false).
		heading = includeAllDescendants ? $(this).find(headingSelector).eq(0) : $(this).children(headingSelector).eq(0) ;
		
		return heading.text() != '' ? heading : $('<h2 />') ; 
	};
	
}( jQuery )); /* end closure */
