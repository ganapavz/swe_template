/**
 * "Frag linx" (Ajax page fragment links) plugin (embeds linked fragments in the document for presentation as tooltips or expandable content)
 * jquery.linx.js
 * @version 0.3
 * Changelog:
 *   *  0.1 Initial implementation
 *   *  0.2 ARIA roles and states added
 *   *  0.3 Added support for a callback function to run after content is expanded or collapsed
 *
 * @author Andrew Ramsden
 * @see http://irama.org/web/dhtml/frag-linx/
 * @license GNU GENERAL PUBLIC LICENSE (GPL) <http://www.gnu.org/licenses/gpl.html>
 * 
 * @requires jQuery (tested with 1.3.1) <http://jquery.com/>
 * 
 */
jQuery.fragLinx = {};
 
jQuery.fragLinx.conf = {
	containerClass : 'frag-linx-container',
	contentClass   : 'frag-linx-content',
	activeClass    : 'active',
	expandedClass  : 'expanded',
	loadingClass   : 'loading'
};


jQuery.fragLinx.defaultOptions = {
	behaviour       : 'expandable', // 'expandable', 'tooltip' (currently only 'expandable' is supported)
	animationSpeed  : 'normal', // 'slow', 'normal' or 'fast' or a number of milliseconds
	linkSelector    : 'a', // can be specified to select some links and not others
	onlyEverOneOpen : true, // if set to true, only one link content can be expanded at a time.
	callback        : null // a callback function to perform after content is expanded or collapsed
};

(function($) {// start closure
	
	
	/**
	 * Expects to be sent DOMNodes that contain links
	 */
	$.fn.fragLinx = function (options) {
		
		options = options || {};
		
		$(this).each(function () {
			initFragLinx.apply(this, [options])
		});
		
		return $(this); // facilitate chaining
	};
	
	
	/**
	 * Expects to be sent DOMNodes that contain links
	 */
	var initFragLinx = function (options) {
		
		// Merge runtime options with defaults
		// Note: The first argument sent to extend is an empty object to
		// prevent extend from overriding the default $.AKN.defaultOptions object.
			options = (typeof options == 'undefined')
				? $.fragLinx.defaultOptions
				: $.extend({}, $.fragLinx.defaultOptions, options)
			;
			
		// find frag links
			fragLinks = $(this).find(options.linkSelector).filter('a[href*="#"]');
			if (fragLinks.size() == 0) {
				$.debug('DEBUG: The "Frag linx" plugin can only be applied to elements that contain A (anchor) elements with a @href attribute containing a fragment identifier (#example)');
			}
		
		// init
			//$.debug($(this).attr('href').split('#')[1]);
			
		// attach events
			fragLinks
				.ariaRole('button')
				.click(toggleFragLinkContent)
				.each(function(){
					$(this).attr('title','Expand: '+$(this).text());
				})
			;
		
		$(this)
			.data('options', options)
			.addClass($.fragLinx.conf.containerClass)
			.addClass($.fragLinx.conf.activeClass)
		;
	};
	
	var toggleFragLinkContent = function (eventObj) {
		nextEl = $(this).next().eq(0);
		if (nextEl.is('.'+$.fragLinx.conf.contentClass)) {
			if (nextEl.is(':hidden')) {
				showFragLink.apply(this);
			} else {
				hideFragLink.apply(this, [doCallback = true]);
			}
		} else {
			// no content element exists, add it, then show it
				fragment = $(this).attr('href').split('#')[1];
				if ($(this).attr('id')=='') {
					$(this).attr('id', 'frag-link-'+fragment)	
				}
				contentEl = 
					$('<div></div>')
					.addClass($.fragLinx.conf.contentClass)
					.attr('id',$.fragLinx.conf.contentClass+'-'+fragment)
					.ariaState('live','assertive') // should alert user soon after content loaded
					//.ariaState('atomic','true') // no longer atomic, use labelledby to indicate label should also be read (see http://www.w3.org/TR/wai-aria/#atomic)
					.ariaState('labelledby',$(this).attr('id'))
					.ariaState('hidden','true')
					.hide()
				;
				$(this).after(contentEl);
				
				showFragLink.apply(this);
		}
		
		
		eventObj.preventDefault();
		return false;
	};
	
	var showFragLink = function () {
		
		linkEl = $(this);
		containerEl = $(this).parents('.'+$.fragLinx.conf.containerClass).eq(0);
		options = containerEl.data('options');
				
		if (options.onlyEverOneOpen) {
			containerEl.find('.'+$.fragLinx.conf.contentClass+'.'+$.fragLinx.conf.expandedClass).prev().each(hideFragLink);
		}
		
		nextEl = $(this).next().eq(0);
		if (!nextEl.is('.'+$.fragLinx.conf.contentClass)) {
			$.debug('DEBUG: .'+$.fragLinx.conf.contentClass+' element could not be found for: a@href='+$(this).attr('href'));
			return;
		}
		
		linkEl.addClass($.fragLinx.conf.loadingClass);
		nextEl
			.addClass($.fragLinx.conf.loadingClass)
			.ariaState('busy','true')
		;
		
		// populate content element
			nextEl.load($(this).attr('href').split('#').join(' #'), function(){
				
				// remove container and first heading
					contents = nextEl.children(':first').contents().not(nextEl.children(':first').firstHeading());
					nextEl
						.empty()
						.append(contents)
					;
				
				if (options.behaviour == 'expandable') {
					nextEl.slideDown(options.animationSpeed, doFragLinxCallback);
				} else {
					nextEl.fadeIn(options.animationSpeed, doFragLinxCallback);
				}
				
				linkEl
					.removeClass($.fragLinx.conf.loadingClass)
					.attr('title','Collapse: '+linkEl.text())
				;
				nextEl
					.addClass($.fragLinx.conf.expandedClass)
					.removeClass($.fragLinx.conf.loadingClass)
					.ariaState('relevant','additions text') // DOMNodes were added (or revealed)
					.ariaState('busy','false')
					.ariaState('hidden','false')
				;
				
				
			});
		
		$(this)
			.ariaState('pressed','true')
			.addClass($.fragLinx.conf.expandedClass)
		;
		//$.debug('showing: '+$(this).attr('href').split('#')[1]);
	};
	var doFragLinxCallback = function () {
		containerEl = $(this).parents('.'+$.fragLinx.conf.containerClass).eq(0);
		var options = containerEl.data('options');
		
		$(this).trigger('x-height-change');
		 
		if (options.callback !== null) {
			options.callback();
		}
	};
	
	var hideFragLink = function (doCallback) {
		nextEl = $(this).next().eq(0);
		if (!nextEl.is('.'+$.fragLinx.conf.contentClass)) {
			$.debug('DEBUG: .'+$.fragLinx.conf.contentClass+' element could not be found for: a@href='+$(this).attr('href'));
			return;
		}
		
		doCallback = doCallback || false;
		
		nextEl.ariaState('busy','true');
		
		if (options.behaviour == 'expandable') {
			if (doCallback) {
				nextEl.slideUp(options.animationSpeed, options.callback);
			} else {
				nextEl.slideUp(options.animationSpeed);
			}
		} else {
			if (doCallback) {
				nextEl.fadeOut(options.animationSpeed, options.callback);
			} else {
				nextEl.fadeOut(options.animationSpeed);
			}
		}
		
		linkEl.attr('title','Expand: '+linkEl.text());
		nextEl
			.removeClass($.fragLinx.conf.expandedClass)
			.ariaState('hidden','true')
			.ariaState('relevant','removals') // DOMNodes were hidden
			.ariaState('busy','false')
		;
		
		$(this)
			.ariaState('pressed','false')
			.removeClass($.fragLinx.conf.expandedClass)
		;
		//$.debug('hiding: '+$(this).attr('href').split('#')[1]);
	};
	
	
	/**
	 * Get the the first and biggest heading inside the current element
	 * @version 3.1
	 * @author Andrew Ramsden <irama.org>
	 * @return jQueryNode The first and biggest heading within the target element,
	 *         or a blank h2 if no headings found.
	 */
	$.fn.firstHeading = function(includeAllDescendants) {
		includeAllDescendants = includeAllDescendants||false;
		
		// @since 3.0: Discovered that jQuery returns nodes in selector order, not DOM order,
		//             which means, this can all be shortened to one line...
		headingSelector = 'h1:first, h2:first, h3:first, h4:first, h5:first, h6:first';
		
		// @since 3.1: Can specify whether to include all descendants (true) or just direct 
		//             children headings (false).
		if (includeAllDescendants) {
			return (heading = $(this).find(headingSelector).eq(0)).text()!='' ? heading : $('<h2></h2>');
		} else {
			return (heading = $(this).children(headingSelector).eq(0)).text()!='' ? heading : $('<h2></h2>');
		}
	};
	
	
})(jQuery); /* end closure */