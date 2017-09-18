/**
 * "The Slideshow" (compact panels with slideshow)
 * jquery.compact.slideshow.js
 * @version 0.98
 * Changelog:
 *   * 0.9  when using variableHeight mode, height is now adjusted after resize event detected
 *   * 0.91 Now storing current panel reference as $.data() on container. This fixes a bug where Chrome would get confused as to which panel was the current panel.
 *   * 0.92 Support added for changing control text and title text as options passed on initialisation.
 *   * 0.93 Support added for CSS image replacement mode.
 *   * 0.94 Changes to how cookies are handled.
 *   * 0.95 Move UI button title attributes into link text (but visually hidden) so that all assistive technologies can successfully render the button label.
 *   * 0.96 Now tests to ensure ARIA keyboard nav plugin exists before trying to use it. Also now has own unique 'active' class so IE6 doesn't get confused when styling active state.
 *   * 0.97 Now allows playback controls to be configured to appear before or after the panel controls in the generated source order (can make some stylings easier).
 *   * 0.98 Now auto-generates unique ids for slideshow sections if ids are not found in the source markup.
 * 
 * @author Andrew Ramsden <http://irama.org/>
 * @see http://irama.org/web/dhtml/compact/slideshow/
 * @license GNU GENERAL PUBLIC LICENSE (GPL) <http://www.gnu.org/licenses/gpl.html>
 * 
 * @requires jQuery (tested with 1.4.2) <http://jquery.com/>
 * @requires jQuery jARIA plugin <http://outstandingelephant.com/jaria/>
 * @requires jQuery Compact base plugin <http://irama.org/web/dhtml/compact/>
 * 
 * @optional (but reccommended) jQuery ResizeEvents plugin <http://irama.org/web/dhtml/resize-events/>
 * @optional (but reccommended) jQuery Got Style? plugin <http://irama.org/web/dhtml/got-style/>
 * @optional (but reccommended) jQuery ARIA keyboard navigation plugin <http://irama.org/web/dhtml/aria/key-nav/>
 * @optional jQuery Cookies plugin <http://plugins.jquery.com/project/cookie>
 * 
 * Notes:
 *   * To instantiate, call $($.compact.slideshow.conf.containerSelector).compactPanels(); on 
 *     document ready, or just before the body tag.
 *
 * TODO:
 *   * Update animation toggle control (COMPLETE)
 *   * Extract classnames to config. (COMPLETE)
 *   * Nice styles (COMPLETE)
 *   * Separate preferences that can be passed as plugin is instantiated for a container. (COMPLETE)
 *   * Create text resize detector plugin to throw custom "x-text-resize" and "x-window-resize" event (COMPLETE)
 *   * Fix resize event handler (text is obscured) (COMPLETE)
 *   * ARIA integration (roles, props and key nav).
 */
;
if (typeof jQuery.compact == 'undefined') {
	jQuery.compact = {};
}

jQuery.compact.slideshow = {};

/**
 * Default options, these can be overridden for each call to compactSlideshow
 */
jQuery.compact.slideshow.defaultOptions = {
	type                     : 'slideshow',
	panelsLoop               : true, // when slideshow or buttons get to the last panel, should it loop back to first panel? (and in reverse)
	slideshowAutoStart       : true, // should the animation start by default?
	slideshowInterval        : 6000, // number of milliseconds till next slide is displayed
	controlsPosition         : 'before', // 'before' (default) or 'after' the slideshow content.
	playbackControlsPosition : 'after', // 'before' or 'after' (default) the generated panel buttons.
	variableHeight           : false, // if set to true, height will animate based on content of current panel. If set to false, height of largest section will be set on load (relies on setting a height attribute for all content images in img tag markup).
	rememberStateInCookie    : true, // if cookie plugin is available the last focussed tab will be remembered (also if slideshow is on or paused is remembered).
	transitionSpeed          : 'slow', // 'slow', 'def' or 'fast'
	heightAdjustSpeed        : 'fast',
	cookieExpiryDays         : 1, // 2012-03-26 bboyle: reducing cookie usage
	nextControlText          : '>',
	nextControlTitleText     : 'Next section',
	prevControlText          : '<',
	prevControlTitleText     : 'Previous section',
	pauseControlText         : '||',
	pauseControlTitleText    : 'Pause slideshow',
	playControlText          : '|>',
	playControlTitleText     : 'Start slideshow',
	supportCSSImgReplace     : false, // if you would like to replace the ascii control characters with images, set this to true
	                               // and ensure the path to a transparent image is also sent as an option. You should then
								   // style the clearPixel image to displace the text, so when images are disabled, the
								   // ascii characters become visible.
								   // See examples at http://irama.org/web/dhtml/compact/slideshow/ for more information.
	clearPixelImg            : 'displacement.png'
};

/**
 * Global configuration (these apply to every instance of compactSlideshow, etc...)
 * Adjust to suit your preferred markup.
 */
jQuery.compact.slideshow.conf = {
	containerSelector : '.'+$.compact._conf.compactClass+'.slideshow',
	activeClass       : 'compact-slideshow-active',
	cookieRefPrefix   : 'c.slideshow#',
	currentRef        : 'current-slideshow-panel', // used as reference for $.data() stored on the container element
	contentsClass     : 'compact-contents',
	windowClass       : 'viewport',
	sliderClass       : 'sliding-tray',
	sectionClass      : 'section',
	controlsClass     : 'controlbar',
	panelsClass       : 'panels',
	currentClass      : 'current',
	actionsClass      : 'actions',
	previousClass     : 'previous',
	nextClass         : 'next',
	toggleClass       : 'toggle-animation',
	animationOnClass  : 'animation-running',
	clearPixelClass   : 'for-css-replacement'
};



// start closure (protects variables from global scope)
(function($){

	// int "global" vars
	var sectionCount = null;
	$.compact.slideshow.initialised = [];


	$.fn.compactSlideshow = function (/* optional */ options) {
		options = options || {};
		
		$(this).each(function () {
			initCompactSlideshow.apply(this, [options]);
		});
		
		return $(this); // facilitate chaining
	};
	
	/**
	 * Each compact plugin has an .init function
	 */
	$.compact.slideshow.init = function (containerEl, /* optional */ options) {
		options = options || {};
		
		initCompactSlideshow.apply(containerEl, [options]);
	};
	
	/**
	 * Each compact plugin has an .handleResizeEvent function
	 */
	$.compact.slideshow.handleResizeEvent = function() {
		for (n=0; n<$.compact.slideshow.initialised.length; n++) {
			setStaticHeightForContainer('#'+$.compact.slideshow.initialised[n]);
		}
	};
	
	
	setAllSlideshowStaticHeights = function () {
		for (n=0; n<$.compact.slideshow.initialised.length; n++) {
		
		containerEl = $('#'+$.compact.slideshow.initialised[n]);
		options = containerEl.data('options');
		// set height?
			if (!options.variableHeight) {	
				setStaticHeight.apply(containerEl);
			}
		}
	};
	$(document).ready( function() {
		/* On document ready, give the browser time to render, then check to see if heights are set correctly */
		window.setTimeout(setAllSlideshowStaticHeights, 500);
	});


	initCompactSlideshow = function (/* optional */ options) {
		
		// is CSS supported? (if gotStyle plugin is not avialable, assume it is supported).
			if (qg.gotStyle() === false) {
				$.debug('DEBUG: Your browser does not have CSS support available or enabled, slideshow script exiting');
				return;
			}
			
		// must have a unique id
			if ($(this).attr('id') == '') {
				
				$.debug('DEBUG: Each "compact slideshow" ('+$.compact.slideshow.conf.containerSelector+') container must have a unique id');
				
				return false;
			}
			if (!$(this).is($.compact.slideshow.conf.containerSelector)) {
				// add the appropriate classes
				$(this).addClass($.compact.slideshow.conf.containerSelector.split('.').join(' '));
			}
		
		
		// hide while loading
			$(this).css('visibility', 'hidden');
		
		
		// Merge runtime options with defaults
		// Note: The first argument sent to extend is an empty object to
		// prevent extend from overriding the default $.AKN.defaultOptions object.
			options = (typeof options == 'undefined')
				? $.compact.slideshow.defaultOptions
				: $.extend({}, $.compact.slideshow.defaultOptions, options)
			;
			$(this).data('options', options);
		
		
		// add contents element
			// $.compact.slideshow.conf.contentsClass
			contentsEl = $('<div class="'+$.compact.slideshow.conf.contentsClass+'"></div>');
			heading = $(this).firstHeading().remove();
			if (heading.text() != '') {
				contentsEl.append(heading);
			}
			
		// add window elements
			windowEl = $('<div class="'+$.compact.slideshow.conf.windowClass+'"><div class="'+$.compact.slideshow.conf.sliderClass+'"></div></div>');

			windowEl.find('.'+$.compact.slideshow.conf.sliderClass).append($(this).contents());
			
			
		// remove existing content, replace with containers
			$(this).empty();
			contentsEl.append(windowEl);
			$(this).append(contentsEl);
		
		// add buttons
			panels = '<ul class="'+$.compact.slideshow.conf.panelsClass+'"></ul>';
			// v0.95: title text now becomes part of the link text to support assistive technologies that don't render the title attribute.
			playBackControls = '<ul class="'+$.compact.slideshow.conf.actionsClass+'">'+
						
						'<li><a href="#" class="'+$.compact.slideshow.conf.previousClass+'" title="'+options.prevControlTitleText+'">'+
			            '<span class="button-symbol">'+options.prevControlText+'</span>'+
			            '<span class="button-title">'+options.prevControlTitleText+'</span></a></li>'+
						
						'<li><a href="#" class="'+$.compact.slideshow.conf.toggleClass+'" title="'+options.pauseControlTitleText+'">'+
			            '<span class="button-symbol">'+options.pauseControlText+'</span>'+
			            '<span class="button-title">'+options.pauseControlTitleText+'</span></a></li>'+
						
						'<li><a href="#" class="'+$.compact.slideshow.conf.nextClass+'" title="'+options.nextControlTitleText+'">'+
			            '<span class="button-symbol">'+options.nextControlText+'</span>'+
			            '<span class="button-title">'+options.nextControlTitleText+'</span></a></li>'+
						
						'</ul>';
		
			// v0.97: The order of playback controls and panel buttons can be switched
			buttons = $('<div class="'+$.compact.slideshow.conf.controlsClass+'"></div>');
			if (options.playbackControlsPosition == 'before') {
				buttons.append(playBackControls+panels);
			} else {
				buttons.append(panels+playBackControls);
			}
			
			if (options.controlsPosition == 'after') {
				$(this).append(buttons);
			} else {
				$(this).prepend(buttons);
			}
		
		
		// add actions to buttons
			$(this).find('.'+$.compact.slideshow.conf.previousClass).click(handlePreviousClick);
			$(this).find('.'+$.compact.slideshow.conf.toggleClass).click(toggleAutoTransitions);
			$(this).find('.'+$.compact.slideshow.conf.nextClass).click(handleNextClick);
		
		// for each section add a link
			sectionCount = 1;
			$(this).find('.'+$.compact.slideshow.conf.sectionClass)
				.ariaState('atomic','true') // each section can be considered atomic
				.each(addSectionTab)
			;
		
		// add clearPixel images if CSSImageReplacement mode is enabled
			if (options.supportCSSImgReplace !== false) {
				$(this).find('.controlbar a span.button-symbol').prepend('<img src="'+options.clearPixelImg+'" alt="" class="'+$.compact.slideshow.conf.clearPixelClass+'" />');
			}
		
		
		// get initial section (from cookie if available)
			//initialSection = $.compact._cookie($.compact.slideshow.conf.cookieRefPrefix+$(this).attr('id')+'.current');
			
			if (options.rememberStateInCookie) {
				var initialSection = $.compact._cookie($.compact.slideshow.conf.cookieRefPrefix+$(this).attr('id')+'.current');
			} else {
				var initialSection = null;
			}
			
			if (
				initialSection === null || // no cookie
				$(this).find('.'+$.compact.slideshow.conf.sectionClass+'#'+initialSection).size() == 0 // section stored in cookie no longer exists
			) {
				// first section by default
					initialSection = $(this).find('.'+$.compact.slideshow.conf.sectionClass+':first').attr('id');
					
			}
			
		// add initial section to container
			$(this).data($.compact.slideshow.conf.currentRef, initialSection);
			
		// ensure all sections will contain floated elements
			$(this).find('.'+$.compact.slideshow.conf.sectionClass).css('overflow','hidden');
		
		// hide all but initial section
			$(this).find('.'+$.compact.slideshow.conf.sectionClass).not('#'+initialSection).hide();
			//currentPanel = $(this).find('.'+$.compact.slideshow.conf.sectionClass+':first-child');
		
		// highlight initial section link
			$(this).find('.'+$.compact.slideshow.conf.panelsClass+' a[href$=#'+initialSection+']').addClass($.compact.slideshow.conf.currentClass);

		
		// get slideshow status from cookie
			//slideshowStatus = $.compact._cookie($.compact.slideshow.conf.cookieRefPrefix+$(this).attr('id')+'.status');
			if (options.rememberStateInCookie) {
				var slideshowStatus = $.compact._cookie($.compact.slideshow.conf.cookieRefPrefix+$(this).attr('id')+'.status');
			} else {
				var slideshowStatus = null;
			}
			
			if (slideshowStatus === null) {
				// start slideshow if autostart is on
					if (options.slideshowAutoStart) {
						// slideshow should be running
							startSlideshow(this);
					} else {
						// ensure controls are up to date
							pauseSlideshow(this);
					}
			} else if (slideshowStatus == 'paused') {
				// slideshow is paused
					pauseSlideshow(this);
			} else {
				// slideshow is running
					startSlideshow(this);
			}
		
		// if ARIA keyboard nav plugin is available, use it
			if ($.fn.managefocus) {
			// use ARIA keyboard nav for browsers that support it
				$('.'+$.compact.slideshow.conf.panelsClass).managefocus(
					'a',
					{
						// "A menu is often a list of links to important sections of a document or a site"
						// (see: http://www.w3.org/TR/wai-aria/#menu)
						role : 'menu',
						ignoreKeys  : [38,40],
						keyHandlers : {
							38 : panelsNavEvent, // up key will open section
							40 : panelsNavEvent // down key will open section
						}
					}
				);
				$('.'+$.compact.slideshow.conf.actionsClass).managefocus(
					'a',
					{
						// "The toolbar is often a subset of functions found in a menubar, designed to 
						// reduced user effort in using these functions" (see: http://www.w3.org/TR/wai-aria/#toolbar)
						role : 'toolbar',
						ignoreKeys  : [38,40],
						keyHandlers : {
							38 : actionsNavEvent, // up key will open section
							40 : actionsNavEvent // down key will open section
						}
					}
				);
			}
			
		
		// lastly set active class
			$(this)
				.addClass($.compact.slideshow.conf.activeClass)
				.ariaState('live','polite')
			;
		
		// Keep a record of the id of each initialised container
			$.compact.slideshow.initialised[$.compact.slideshow.initialised.length++] = $(this).attr('id');
		
		
		// now active styles are applied, if container should have static height...
			if (!options.variableHeight) {
				// static height
				// find height of tallest section, set to that height
					windowEl.height(getTallestSlideshowSection(this));
					windowEl.trigger('x-height-change');
			}
		
		// all content loaded, reveal.
			$(this)
				//.fadeTo(0,0)
				.css('visibility', 'visible')
				//.fadeTo(options.transitionSpeed,1) // fadein is breaking elements pushed outside the container element using negative margins (IE6 & 7).
			;
	};
	
	panelsNavEvent = function (eventObj) {
		handleTabClick.apply(this);
		
		eventObj.preventDefault();
		return false;
	};
	
	actionsNavEvent = function (eventObj) {
		if ($(this).is('.'+$.compact.slideshow.conf.previousClass)) {
			handlePreviousClick.apply(this);
		} else if ($(this).is('.'+$.compact.slideshow.conf.nextClass)) {
			handleNextClick.apply(this);
		} else if ($(this).is('.'+$.compact.slideshow.conf.toggleClass)) {
			toggleAutoTransitions.apply(this);
		}
		eventObj.preventDefault();
		return false;
	};
	
	setStaticHeightForContainer = function (containerElement) {
		setStaticHeight.apply($(containerElement));
	};
	
	/**
	 * Sets a static height based on the height of the tallest section
	 */
	setStaticHeight = function() {
		var options = $(this).data('options'),
			windowEl = $(this).find('.'+$.compact.slideshow.conf.windowClass),
			height
		;
		
		if (options.variableHeight) {
			// animate to the height now required by the current section
				//currentSection = $(containerEl).find('.'+$.compact.slideshow.conf.sectionClass+'.'+$.compact.slideshow.conf.openClass+':first');
				currentSection = getCurrentPanel(this);
				windowEl.stop().animate({'height': $(currentSection).fullHeight()}, options.heightAdjustSpeed, function(){
					$(this).trigger('x-height-change');
				});
		} else {
			// static height
			height = getTallestSlideshowSection(this);

			// only animate and trigger event if height actually changed
			if ( height !== windowEl.height() ) {
				windowEl.stop().animate({'height':height}, options.heightAdjustSpeed, function(){
					$(this).trigger('x-height-change');
				});
			}
		}
	};
	
	getTallestSlideshowSection = function (containerEl) {
		tallest = 0;
		$(containerEl).find('.'+$.compact.slideshow.conf.sectionClass).each(function() {
			if (tallest < (sectionHeight = $(this).fullHeight())) {
				tallest = sectionHeight;
			}
		});
		return tallest;
	};
	
	startSlideshow = function (containerEl) {
		_setSlideshowTimeout(containerEl);
		
		options = $(containerEl).data('options');
		
		// set cookie
			$.compact._cookie(
				$.compact.slideshow.conf.cookieRefPrefix+$(containerEl).attr('id')+'.status',
				'running',
				{expires : options.cookieExpiryDays}
			);
			
		// update controls (animation toggle)
			toggle = $(containerEl)
				.data('animation','running')
				.addClass($.compact.slideshow.conf.animationOnClass)
				.find('.'+$.compact.slideshow.conf.actionsClass+' .'+$.compact.slideshow.conf.toggleClass)
			;
			toggle
					.attr('title', options.pauseControlTitleText)
					.ariaState('pressed','true')
					.find('span.button-symbol')
						.text(options.pauseControlText).end()
					.find('span.button-title')
						.text(options.pauseControlTitleText)
					
			;
			if (options.supportCSSImgReplace !== false) {
				toggle.find('span.button-symbol')
					.prepend('<img src="'+options.clearPixelImg+'" alt="" class="'+$.compact.slideshow.conf.clearPixelClass+'" />');
			}
	};
	
	pauseSlideshow = function (containerEl) {
		_clearSlideshowTimeout(containerEl);
		
		options = $(containerEl).data('options');
		
		// set cookie
			$.compact._cookie(
				$.compact.slideshow.conf.cookieRefPrefix+$(containerEl).attr('id')+'.status',
				'paused',
				{expires : options.cookieExpiryDays}
			);
			
		// update controls (animation toggle)
			toggle = $(containerEl)
				.data('animation','paused')
				.removeClass($.compact.slideshow.conf.animationOnClass)
				.find('.'+$.compact.slideshow.conf.actionsClass+' .'+$.compact.slideshow.conf.toggleClass)
			;
			toggle
					.attr('title', options.playControlTitleText)
					.ariaState('pressed','false')
					.find('span.button-symbol')
						.text(options.playControlText).end()
					.find('span.button-title')
						.text(options.playControlTitleText)
			;
			if (options.supportCSSImgReplace !== false) {
				toggle.find('span.button-symbol')
					.prepend('<img src="'+options.clearPixelImg+'" alt="" class="'+$.compact.slideshow.conf.clearPixelClass+'" />');
			}
	};
	
	_clearSlideshowTimeout = function (containerEl) {
		toID = $(containerEl).data('animationTimeoutId');
		if (typeof toID != 'undefined') {
			window.clearTimeout(toID);
		}
	};
	
	_setSlideshowTimeout = function (containerEl) {
		_clearSlideshowTimeout(containerEl);
		options = $(containerEl).data('options');
		toID = window.setTimeout('handleSlideshowNext(\'#'+$(containerEl).attr('id')+'\')', options.slideshowInterval);
		$(containerEl).data('animationTimeoutId', toID);
	};
	
	handleSlideshowNext = function (containerId) {
		// find next control, give it a click
			handleNextClick.apply(
				$(containerId).find('.'+$.compact.slideshow.conf.actionsClass+' .'+$.compact.slideshow.conf.nextClass),
				[beAssertive=false]
			);
	};
	
	addSectionTab = function () {
		
		containerEl = getContainerEl(this);
		
		// each section must have a unique id
			if (! $(this).attr('id')) {
				
				id = containerEl.attr('id')+'-section-'+sectionCount;
				$(this).attr('id', id);
				
				//$.debug('DEBUG: Each "compact slideshow" ('+$.compact.slideshow.conf.containerSelector+') section must have a unique id. Auto-generating one for this section (#'+id+')');
				
			} else {
				id = $(this).attr('id');
			}
		
		
		//var listItem = $('<li><a href="#'+id+'" title="'+$(this).firstHeading(true).text()+'"><span>'+(sectionCount++)+'</span></a></li>');
		
		var listItem = $(
			'<li><a href="#'+id+'" title="'+$(this).firstHeading(true).text()+'">'+
			'<span class="button-symbol">'+sectionCount+'</span>'+
			'<span class="button-title">'+(sectionCount++)+'</span></a></li>'
		);
		
		
		listItem.find('a')
			.data('section',id)
			.click(handleTabClick)
		;
		containerEl.find('ul.'+$.compact.slideshow.conf.panelsClass).append(listItem);
	};
	
	handleTabClick = function () {
		containerEl = getContainerEl(this);
		currentPanel = getCurrentPanel(this);
		newPanel = containerEl.find('.'+$.compact.slideshow.conf.sectionClass+'#'+$(this).data('section'));
		if (newPanel.attr('id') == currentPanel.attr('id')) {
			return false;
		}
		jumpToPanel(newPanel);
		
		return false; // suppress # link being followed
	};
	
	handlePreviousClick = function () {
		// find container element and options
			containerEl = getContainerEl(this);
			options = $(containerEl).data('options');
		
		// user initiated action, report assertively (jumpToPanel returns reporting to polite)
			containerEl.ariaState('live','assertive');
		
		currentPanel = getCurrentPanel(this);
		newPanel = currentPanel.prevAll('.'+$.compact.slideshow.conf.sectionClass+':first');
		if (newPanel.size()>0) {;
			jumpToPanel(newPanel);
		} else if (options.panelsLoop) {
			// load last panel
				newPanel = currentPanel.siblings(':last-child');
				jumpToPanel(newPanel);
		}
		return false; // suppress # link being followed
	};
	
	/**
	 * ARIA note: After a user initiated action, we want the live region to report updated content
	 * assertively. When the slideshow calls this function, only report changes politely (i.e: beAssertive = false).
	 */
	handleNextClick = function (beAssertive) {
		// find container element and options
			containerEl = getContainerEl(this);
			options = $(containerEl).data('options');
		
		beAssertive = (beAssertive !== false) ? true : false; // if unspecified default is true
		
		if (beAssertive) {
			// Note about ARIA 'live' property:
			// this property will be returned to "polite" by the jumpToPanel function after the 
			// change has been committed (busy=false) therefore hopefully after the UA has 
			// assertively reported it.
			// beAssertive should be set to false if this function is being called but not 
			// because of a user-initiated action.
				containerEl.ariaState('live','assertive');
		}
		
		currentPanel = getCurrentPanel(this);
		newPanel = currentPanel.nextAll('.'+$.compact.slideshow.conf.sectionClass+':first');
		//newPanel = currentPanel.nextAll('.'+$.compact.slideshow.conf.sectionClass).eq(0);
		if (newPanel.size() > 0) {
			jumpToPanel(newPanel);
		} else if (options.panelsLoop) {
			// load first panel
				newPanel = currentPanel.siblings(':first');
				//newPanel = containerEl.find('.'+$.compact.slideshow.conf.sectionClass).eq(0);
				jumpToPanel(newPanel);
		}
		
		return false; // suppress # link being followed
	};
	
	toggleAutoTransitions = function () {
		
		containerEl = getContainerEl(this);
		if (containerEl.data('animation') == 'running') {
			pauseSlideshow(containerEl);
		} else {
			startSlideshow(containerEl);
			handleSlideshowNext(containerEl); // trigger animation straight away
		}
		
		return false; // suppress # link being followed
	};
	
	jumpToPanel = function (newPanel) {
		
		setCurrentPanel(newPanel);
		updatePanelLinks(newPanel);
		
		// find container element and options
			//var containerEl = getContainerEl(newPanel);
			//var options = $(containerEl).data('options');
			containerEl = getContainerEl(newPanel);
			options = $(containerEl).data('options');
			
		// find the window element
			windowEl = containerEl.find('.'+$.compact.slideshow.conf.windowClass+':first');
		
		// For first transition, set window to height of open section
			if (options.variableHeight) {			
				windowEl.animate({height:newPanel.fullHeight()}, function(){
					$(this).trigger('x-height-change');
				});
			}
		
		containerEl.ariaState('busy','true');
		
		// fadeOut visible sections
			windowEl.find('.'+$.compact.slideshow.conf.sectionClass+':visible').not(newPanel)
				.stop()
				.ariaState('hidden','true')
				.fadeOut(options.transitionSpeed, function() {			
					
					//var containerEl = getContainerEl(newPanel);
					//var options = $(containerEl).data('options');
					containerEl = getContainerEl(newPanel);
					options = $(containerEl).data('options');
					
					// hide any other panels that slipped through the cracks (happens sometimes)
						containerEl
							.find(
								'.'+$.compact.slideshow.conf.windowClass+':first .'+$.compact.slideshow.conf.sectionClass
							).visible().not(newPanel)
								.stop().hide()
								.ariaState('hidden','true')
						;
					
					// fadeIn new section (after old section has faded and gone completely)
						//newPanel.stop().fadeIn(options.transitionSpeed).fadeTo(options.transitionSpeed,1,function(){
						newPanel.stop().fadeTo(0,0).show().fadeTo(options.transitionSpeed,1,function(){
							// Clean up for IE 6, 7, 8 (seems to affect only Windows OS with ClearType enabled)
							// (perhaps IE9 also in future? If 9 also suffers, change the next line to include 9)
								if ( qg.oldIE ) {
									$(this).get(0).style.filter = '';
								}
							
							// update states
								$(this).ariaState('hidden','false');
								// if this action was user-initiated it is now over, return reporting mode to polite
								containerEl
									.ariaState('relevant','all') // content was hidden, other content was revealed
									.ariaState('busy','false')
									.ariaState('live','polite')
								;
						});
				})
			;
		
		
		// animate window to height of new section
			if (options.variableHeight) {	
				windowEl.stop().animate({height:newPanel.fullHeight()},'','',function(){
					//windowEl.css('height','auto');
					$(this).trigger('x-height-change');
				});
			}
		
		
		// set cookie
			$.compact._cookie(
				$.compact.slideshow.conf.cookieRefPrefix+containerEl.attr('id')+'.current',
				newPanel.attr('id'),
				{expires : options.cookieExpiryDays}
			);
		
		// if panels are auto animating, set new timer
			if (containerEl.data('animation') == 'running') {
				_setSlideshowTimeout(containerEl);
			}
		
	};
	
	getContainerEl = function (childEl) {
			return ($(childEl).eq(0).is($.compact.slideshow.conf.containerSelector))
				? $(childEl).eq(0)
				: $(childEl).parents($.compact.slideshow.conf.containerSelector+':first')
			;
	};
	
	getCurrentPanel = function (childEl, /* optional */ containerEl) {
		containerEl = containerEl || getContainerEl(childEl);
		// find current panel link
			return containerEl.find('#'+containerEl.data($.compact.slideshow.conf.currentRef));
	};
	
	setCurrentPanel = function (newPanel) {
		getContainerEl(newPanel).data($.compact.slideshow.conf.currentRef, newPanel.attr('id'));
	};
	
	
	updatePanelLinks = function (newPanel) {
		getContainerEl(newPanel)
			.find('.'+$.compact.slideshow.conf.panelsClass+' a') // find all panel links
			.removeClass($.compact.slideshow.conf.currentClass) // remove current class
			
			.filter('[href$=#'+$(newPanel).attr('id')+']') // find newpanel link
			.addClass($.compact.slideshow.conf.currentClass) // flag as current
			//.each(function(){$.debug('new current set to '+$(this).attr('href')+' after matching '+$(newPanel).attr('id'));})
		;
	};
	
}( jQuery )); /* end closure */
