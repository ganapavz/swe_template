/**
 * "The Slider" (compact sliding panels)
 * jquery.compact.slider.js
 * @version 0.94
 * Changelog:
 *   * 0.8 Added an adjustment of sliders on DOMLoad to fix issue that webkit sometimes renders incorrectly on load.
 *   * 0.9 Aria roles and states/properties integrated. (IN PROGRESS)
 *   * 0.91 Support added for changing control text and title text as options passed on initialisation and support added for CSS image replacement mode.
 *   * 0.92 Move UI button title attributes into link text (but visually hidden) so that all assistive technologies can successfully render the button label.
 *   * 0.93 Updated hold/release of next/prev buttons so endless loop bug can't be triggered. Also added option to disable hold next/prev support.
 *   * 0.94 Now has own unique 'active' class so IE6 doesn't get confused when styling active state.
 *
 * @author Andrew Ramsden <http://irama.org/>
 * @see http://irama.org/web/dhtml/compact/slider/
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
 * TODO:
 *   * Extract classnames to config. (COMPLETE)
 *   * Improve resize handling (currently based on global selector, rather than actual widget initialised). (COMPLETE)
 *   * Separate preferences that can be passed as plugin is instantiated for a container. (COMPLETE)
 *   * ARIA integration (roles, props and key nav).
 *   * Improve mouse interaction. Holding mouse down on next/prev should move through multiple panels as long as mouse is down. (COMPLETE)
 */
;
if (typeof jQuery.compact == 'undefined') {
	jQuery.compact = {};
}
jQuery.compact.slider = {};

/**
 * Default options, these can be overridden for each call to compactSlider
 */
jQuery.compact.slider.defaultOptions = {
	type                : 'slider',
	controlsMatchHeight : true,
	animationDuration   : 500,
	collapseDuration    : 250,
	cookieExpiryDays    : 30,
	nextControlText       : '>',
	nextControlTitleText  : 'Next',
	prevControlText       : '<',
	prevControlTitleText  : 'Previous',
	supportHoldToScroll   : true, // set to false to disable holding of next/prev buttons to auto scroll through items.
	supportCSSImgReplace  : true, // if you would like to replace the ascii control characters with images, set this to true
	                               // and ensure the path to a transparent image is also sent as an option. You should then
								   // style the clearPixel image to displace the text, so when images are disabled, the
								   // ascii characters become visible.
								   // See examples at http://irama.org/web/dhtml/compact/slider/ for more information.
	clearPixelImg         : 'displacement.png'
};

/**
 * Global configuration (these apply to every instance of compactSlider, etc...)
 * Adjust to suit your preferred markup.
 */
jQuery.compact.slider.conf = {
	containerSelector   : '.'+$.compact._conf.compactClass+'.slider',
	activeClass         : 'compact-slider-active',
	controlElClass      : 'slider-control',
	cookieRefPrefix     : 'c.slider#',
	prevControlClass    : 'prev-panel',
	nextControlClass    : 'next-panel',
	sliderElClass       : 'sliding-tray',
	viewportElClass     : 'viewport',
	contentsElClass     : 'slider-contents',
	measureElClass      : 'measure',
	panelClass          : 'section',
	loadingClass        : 'loading',
	clearPixelClass     : 'for-css-replacement',
	holdControlInterval : 300, // (in ms) When a control is held down (mousedown) how often should it jump to next panel?
	errorMargin         : 1  // FF2 & FF3 seem to be 1px out (rounding error??)
};




// start closure (protects variables from global scope)
(function($){

	// init vars global to the scope of this plugin
		$.compact.slider.initialised = [];
		holdIntervalId = null;
		numberOfMovesWhileHeld = 0;



	$.fn.compactSlider = function (options) {

		options = options || {};

		$(this).each(function () {
			initCompactSlider.apply(this, [options])
		});

		return $(this); // facilitate chaining
	};

	$.compact.slider.init = function (containerEl, /* optional */ options) {
		options = options || {};

		initCompactSlider.apply(containerEl, [options]);
	};


	$.compact.slider.handleResizeEvent = function() {
		for (n=0; n<$.compact.slider.initialised.length; n++) {
			containerEl = $('#'+$.compact.slider.initialised[n]);
			scrollToPanel(containerEl, containerEl.data('currentPanel'));
		}
	};

	$(document).ready( function() {
		/* On document ready, give the browser time to render, then check to see if heights are set correctly */
		window.setTimeout(adjustAllSliders, 250);
	});

	adjustAllSliders = function () {
		if($.compact.slider !== undefined){
			for (n=0; n<$.compact.slider.initialised.length; n++) {
				$('#'+$.compact.slider.initialised[n]).each(adjustSlidingPanels, [true]);
			}
		}
	};


	initCompactSlider = function (options) {

		// is CSS supported? (if gotStyle plugin is not avialable, assume it is supported).
			if (typeof $.browser.gotStyle != 'undefined' && $.browser.gotStyle(this) === false) {
				$.debug('DEBUG: Your browser does not have CSS support available or enabled, slider script exiting');
				return;
			}

		// does the container have the correct classes and an id?
			if (typeof $(this).attr('id') == 'undefined') {
				$.debug('DEBUG: Each "compact slider" ('+$.compact.slider.conf.containerSelector+') container must have a unique id');
				return;
			}
			if (!$(this).is($.compact.slider.conf.containerSelector)) {
				// add the appropriate classes
				$(this).addClass($.compact.slider.conf.containerSelector.split('.').join(' '));
			}

		// Merge runtime options with defaults
		// Note: The first argument sent to extend is an empty object to
		// prevent extend from overriding the default $.AKN.defaultOptions object.
			options = (typeof options == 'undefined')
				? $.compact.slider.defaultOptions
				: $.extend({}, $.compact.slider.defaultOptions, options)
			;
			$(this).data('options', options);



		// setup controls
		// v0.92: title text now becomes part of the link text to support assistive technologies that don't render the title attribute.
			prevControl = $('<a class="'+$.compact.slider.conf.controlElClass+' '+$.compact.slider.conf.prevControlClass+
			                '" id="'+$(this).attr('id')+'-'+$.compact.slider.conf.prevControlClass+'" href="#previous"'+
							' title="'+options.prevControlTitleText+'">'+
				            '<span class="button-symbol">'+options.prevControlText+'</span>'+
				            '<span class="button-title">'+options.prevControlTitleText+'</span></a>'
			)
				.click(handleClickPrevious)
				.ariaRole('button')
				.ariaState('controls',$(this).attr('id'))
			;
			nextControl = $('<a class="'+$.compact.slider.conf.controlElClass+' '+$.compact.slider.conf.nextControlClass+
			                '" id="'+$(this).attr('id')+'-'+$.compact.slider.conf.nextControlClass+'" href="#next"'+
							' title="'+options.nextControlTitleText+'">'+
				            '<span class="button-symbol">'+options.nextControlText+'</span>'+
				            '<span class="button-title">'+options.nextControlTitleText+'</span></a>'
			)
				.click(handleClickNext)
				.ariaRole('button')
				.ariaState('controls',$(this).attr('id'))
			;

		// If hold to scroll support is enabled, setup event handlers
			if (options.supportHoldToScroll) {

				prevControl.mousedown(handleHoldPrevious);
				nextControl.mousedown(handleHoldNext);
				/**
				 * Delegate mouseup to body so that it is never missed!
				 * (even if the user clicks and drags off button before release).
				 */
				$('body').bind('mouseup', handleNextPrevRelease);
			}


		// add window element
			viewportEl = $('<div class="'+$.compact.slider.conf.viewportElClass+'"><div class="'+$.compact.slider.conf.sliderElClass+'"></div></div>');
			sliderEl = viewportEl.find('.'+$.compact.slider.conf.sliderElClass);
			sliderEl.append ($(this).contents('.'+$.compact.slider.conf.panelClass));
			$(this).contents('.'+$.compact.slider.conf.panelClass).remove();
			contentsEl = $('<div class="'+$.compact.slider.conf.contentsElClass+'"></div>')
				.append(prevControl)
				.append(viewportEl)
				.append(nextControl)
			;
			$(this).append(contentsEl);


		// add clearPixel images if CSSImageReplacement mode is enabled
			if (options.supportCSSImgReplace) {
				contentsEl.find('a.'+$.compact.slider.conf.controlElClass+' span.button-symbol').prepend('<img src="'+options.clearPixelImg+'" alt="" class="'+$.compact.slideshow.conf.clearPixelClass+'" />');
			}

		// draw curtain until ready
			$(this)
				.addClass($.compact.slider.conf.loadingClass)
				.children().css('visibility','hidden')
			;

		// add active class
			$(this)
				.addClass($.compact.slider.conf.activeClass)
				.ariaState({
					live     : 'assertive',
					atomic   : 'false',
					relevant : 'all'
				})
				//.width('auto')
				.after('<div class="'+$.compact.slider.conf.measureElClass+'" style="width:100%;clear:both;height:0;padding:0;margin:0;border:none;float:none;"></div>');
			;

		// set the sliding-tray element to an approximate width that will encompass all panels
			panels = $(this).find('.'+$.compact.slider.conf.panelClass);
			firstPanelWidth = panels.eq(0).outerWidth(true); // will include margins
			sliderEl.width(firstPanelWidth * panels.size() * 4); // Webkit has trouble at large text sizes unless size is multiplied (by 4 should be enough)


		// get initial panel (from cookie if available)
			currentPanelIndex = $.compact._cookie($.compact.slider.conf.cookieRefPrefix+$(this).attr('id')+'.current');
			currentPanelIndex = (currentPanelIndex !== null) ? parseInt(currentPanelIndex) : 0 ;


		// load current panel
			scrollToPanel(this, currentPanelIndex, doAnimation=false);


		// Keep a record of the id of each initialised container
			$.compact.slider.initialised[$.compact.slider.initialised.length++] = $(this).attr('id');

		// IE6 needs some time (10ms?) or else it will only display 1 initially (???)
		// FF2/3 need some time (10ms?) or else some edge cases one too few panels will be displayed initially
			//window.setTimeout('adjustSlidingPanelsId(\'#'+$(this).attr('id')+'\')', 10);

	};

	adjustSlidingPanelsId = function (containerSelector) {
		$(containerSelector).each(adjustSlidingPanels, [true]);
	};

	adjustSlidingPanels = function (inital) {

		// was this function called during initialisation?
			inital = inital||false;

		// init node references
			options = $(this).data('options');
			panels = $(this).find('.'+$.compact.slider.conf.panelClass);
			firstPanel = panels.eq(0);
			prevControl = $(this).find('.'+$.compact.slider.conf.prevControlClass);
			nextControl = $(this).find('.'+$.compact.slider.conf.nextControlClass);
			viewportEl = $(this).find('.'+$.compact.slider.conf.viewportElClass);
			contentsEl = $(this).find('.'+$.compact.slider.conf.contentsElClass);

			controlWidths =
				prevControl.outerWidth(true) +
				nextControl.outerWidth(true)
			;

		// allow panels to expand
			panels.height('auto');


		// set consistent height of panels (based on tallest panel)
			tallestSoFar = 0;
			widestSoFar = 0;
			panels
				.each(function(){
					if ($(this).height() > tallestSoFar) {
						tallestSoFar = $(this).height();
					}
				})
				.height(tallestSoFar)
			;

		// set height of contents element (in case controls get pushed over to wrap
			contentsEl.height(firstPanel.outerHeight(true));



		// should controls be given matching height?
			if (options.controlsMatchHeight) {
				// store height
					firstPanelHeight = firstPanel.outerHeight();

				// set heigt of controls
					prevControl.height(firstPanelHeight).css({'margin-top':firstPanel.css('margin-top'),'margin-bottom':firstPanel.css('margin-bottom')});
					nextControl.height(firstPanelHeight).css({'margin-top':firstPanel.css('margin-top'),'margin-bottom':firstPanel.css('margin-bottom')});

				// set height for clearPixelImage if required
					if (options.supportCSSImgReplace) {
						prevControl.find('img.'+$.compact.slider.conf.clearPixelClass).height(firstPanelHeight);
						nextControl.find('img.'+$.compact.slider.conf.clearPixelClass).height(firstPanelHeight);
					}
			}



		// how many panels can we fit??
			totalPanels = panels.size();
			availableWidth = $(this).next('.'+$.compact.slider.conf.measureElClass).innerWidth() - controlWidths;
			panelsDisplayed = 0;
			panelIndex = $(this).data('currentPanel');
			nextPanelWidth = parseInt(panels.eq(panelIndex).outerWidth(true));
			widthUsedSoFar = 0;

			while (panelsDisplayed < totalPanels && (widthUsedSoFar+nextPanelWidth) < availableWidth) {
				widthUsedSoFar = widthUsedSoFar+nextPanelWidth;

				panelsDisplayed++;
				panelIndex++;

				if (panels.eq(panelIndex).size() == 0) {
					// no more on the right, check if more from the left would fit
						previousWidthUsedSoFar = widthUsedSoFar;
						panelIndex = $(this).data('currentPanel');
						nextPanelWidth = parseInt(panels.eq(panelIndex).outerWidth(true));

						while (panelsDisplayed < totalPanels && (widthUsedSoFar+nextPanelWidth) < availableWidth) {
							widthUsedSoFar = widthUsedSoFar+nextPanelWidth;
							panelsDisplayed++;
							panelIndex--;

							nextPanelWidth = parseInt(panels.eq(panelIndex).outerWidth(true));
						}

					// if width changed, scroll to new panel
						if (previousWidthUsedSoFar != widthUsedSoFar) {
							scrollToPanel(this, panelIndex);
							return; // don't animate this scroll
						} else {
							// no change (no room for extra elements)
							// just break out of while loop, then continue
								break;
						}
				}
				nextPanelWidth = parseInt(panels.eq(panelIndex).outerWidth(true));
			}

		// at least one panel must be displayed
			if (panelsDisplayed == 0) {
				panelsDisplayed = 1;
				widthUsedSoFar =  parseInt(panels.eq(panelIndex).outerWidth(true));
			}


		// Set widths of viewport and contents

			// Is this the initialisation phase?
			if (inital) { // The initialisation phase, don't animate the dimensions this time.

				// set width of contents, for centering.
					contentsEl.width(widthUsedSoFar + controlWidths + $.compact.slider.conf.errorMargin);

				// set viewport width for num of panels that will fit
					viewportEl.width(widthUsedSoFar);


				// reveal the widget
					$(this)
						.removeClass($.compact.slider.conf.loadingClass) // no longer loadin
						.fadeTo(0,0) // drop opacity to 0
						.children().css('visibility','visible') // re-instate children
						.end() // back up to container
							.fadeTo(options.animationDuration, 1) // fade container in
					;

			} else { // Not the initialisation phase, so, animate stuff

				// Is the viewport getting bigger or smaller?
				if (widthUsedSoFar < $(this).data('currentViewPortWidth')) { // getting smaller, animate viewport first

					// set viewport width for num of panels that will fit
						viewportEl.stop().animate(
							{width: widthUsedSoFar},
							options.collapseDuration
						);

					// set width of contents, for centering.
						contentsEl.stop().animate(
							{width: widthUsedSoFar + controlWidths + $.compact.slider.conf.errorMargin},
							options.collapseDuration+50 // slightly slower
						);

				} else { // getting bigger, animate contents first

					// store number of panels for later
						$(this).data('numPanelsDisplayed', panelsDisplayed);
						$(this).data('currentViewPortWidth', widthUsedSoFar);

					// set width of contents, for centering.

						contentsEl.stop().animate(
							{width: widthUsedSoFar + controlWidths + $.compact.slider.conf.errorMargin},
							options.collapseDuration
						);

					// set viewport width for num of panels that will fit
						viewportEl.stop().animate(
							{width: widthUsedSoFar},
							options.collapseDuration
						);

					// check to see if whitespace at end
						if (totalPanels - $(this).data('currentPanel') < panelsDisplayed) {
							scrollToPanel(this, totalPanels - panelsDisplayed);
						}

					// update the disabled/enabled state of the controls and panels/links
						updatePanelStates(panels, $(this).data('currentPanel'), panelsDisplayed);
						updateControlStates(this);
						return;
				}
			}



		// store number of panels and viewport width for later
			$(this).data('numPanelsDisplayed', panelsDisplayed);
			$(this).data('currentViewPortWidth', widthUsedSoFar);

		// update the disabled/enabled state of the controls and panels/links
			updatePanelStates(panels, $(this).data('currentPanel'), panelsDisplayed);
			updateControlStates(this);

	};

	updatePanelStates = function (panels, currentIndex, panelsDisplayed) {
		// update ARIA states/properties
			for (n = 0; n < panels.size(); n++) {
				if (n < currentIndex || n >= (currentIndex + panelsDisplayed)) {
					// These panels are hidden
					//   * remove links from tab order
					//   * set hidden
						panels.eq(n)
							.ariaState('hidden','true')
							.find('a').attr('tabindex','-1')
				} else {
					// These panels are visible
					//   * add links to tab order
					//   * set visible
						panels.eq(n)
							.ariaState('hidden','false')
							.find('a').attr('tabindex','') // add back into tabindex ('0' is recommended by ARIA, but not supported by some browsers. '' should work universally)
				}
			}
	};

	updateControlStates = function (containerEl) {

		panels = $(containerEl).find('.'+$.compact.slider.conf.panelClass);
		prevControl = $(containerEl).find('.'+$.compact.slider.conf.prevControlClass);
		nextControl = $(containerEl).find('.'+$.compact.slider.conf.nextControlClass);

		// are there hidden panels on the left?
			if ($(containerEl).data('currentPanel') != 0) {
				// enable previous control
					prevControl.removeClass('disabled prev-disabled');
			} else {
				// disable previous control
					prevControl.addClass('disabled prev-disabled');
			}

		// are there hidden panels on the right?
			if ($(containerEl).data('currentPanel')+$(containerEl).data('numPanelsDisplayed') < panels.size()) {
				// enable previous control
					nextControl.removeClass('disabled next-disabled');
			} else {
				// disable previous control
					nextControl.addClass('disabled next-disabled');
			}
	};


	handleHoldPrevious = function () {
		// reset count
			numberOfMovesWhileHeld = 0;

		// set busy
			containerEl = $(this).getSliderContainer().ariaState('busy','true');

		// trigger first scroll immediately
			prevHeldInterval($(this).attr('id'));

		// set interval
			holdIntervalId = window.setInterval('prevHeldInterval("'+$(this).attr('id')+'")', $.compact.slider.conf.holdControlInterval);

		// return false, prevent default action
			return false;
	};

	handleHoldNext = function () {
		// reset count
			numberOfMovesWhileHeld = 0;

		// set busy
			containerEl = $(this).getSliderContainer().ariaState('busy','true');

		// trigger first scroll immediately
			nextHeldInterval($(this).attr('id'));

		// set interval
			holdIntervalId = window.setInterval('nextHeldInterval("'+$(this).attr('id')+'")', $.compact.slider.conf.holdControlInterval);

		// return false, prevent default action
			return false;
	};

	/**
	 * on release, clear all animiations (this event handler delegated to the body)
	 */
	handleNextPrevRelease = function () {

		if (holdIntervalId == null) {
			return;
		}

		// clear interval
			window.clearInterval(holdIntervalId);
			holdIntervalId = null;

		// for each slider
			$($.compact.slider.conf.containerSelector).each(function(){
				// Tidy up on release (adjustments, etc...)
					adjustSlidingPanels.apply($(this));

				// end busy
					$(this).ariaState('busy','false');
			});

		// return false, prevent default action
			return false;
	};

	/**
	 * Occurs repeatedly while 'previous' control is being held down
	 */
	prevHeldInterval = function (controlId) {
		numberOfMovesWhileHeld++;
		result = doPrevious.apply($('#'+controlId),[
			doAdjustments = false // hold off doing adjustments till control is released (better performance)
		]);
		//updateControlStates($(this).parents($.compact.slider.conf.containerSelector+':first'));

		// If we've hit the end of the slider, release
			if (!result) {
				handleNextPrevRelease();
			}
	};

	/**
	 * Occurs repeatedly while 'next' control is being held down
	 */
	nextHeldInterval = function (controlId) {
		numberOfMovesWhileHeld++;
		result = doNext.apply($('#'+controlId),[
			doAdjustments = false // hold off doing adjustments till control is released (better performance)
		]);
		//updateControlStates($(this).parents($.compact.slider.conf.containerSelector+':first'));

		// If we've hit the end of the slider, release
			if (!result) {
				handleNextPrevRelease();
			}
	};

	/**
	 * Triggered on 'click' even of 'previous' control
	 */
	handleClickPrevious = function () {

		// Only perform click action if no moves occurred while held
			if (numberOfMovesWhileHeld == 0) {
				containerEl = $(this).getSliderContainer().ariaState('busy','true');
				doPrevious.apply(this);
				containerEl.ariaState('busy','false');
			}

		// reset count
			numberOfMovesWhileHeld = 0;

		// return false, prevent default action
			return false;
	};

	/**
	 * Triggered on 'click' even of 'next' control
	 */
	handleClickNext = function () {

		// Only perform click action if no moves occurred while held
			if (numberOfMovesWhileHeld == 0) {
				containerEl = $(this).getSliderContainer().ariaState('busy','true');
				doNext.apply(this);
				containerEl.ariaState('busy','false');
			}

		// reset count
			numberOfMovesWhileHeld = 0;

		// return false, prevent default action
			return false;
	};

	/**
	 * Navigate to 'previous' panel
	 */
	doPrevious = function(/* optinal */ doAdjustments) {
		// set defaults for optional arguments
			doAdjustments = (typeof doAdjustments == 'undefined')? true : doAdjustments ;

		// do nothing for disabled controls
			if ($(this).is('.disabled')) {
				return false;
			}

		// slide panels
			return scrollToPanel(
				containerEl   = $(this).getSliderContainer(),
				newPanelIndex = $(containerEl).data('currentPanel') - 1,
				doAnimation = true,
				doAdjustments
			);
	};

	/**
	 * Navigate to 'next' panel
	 */
	doNext = function(/* optinal */ doAdjustments) {
		// set defaults for optional arguments
			doAdjustments = (typeof doAdjustments == 'undefined')? true : doAdjustments ;

		// do nothing for disabled controls
			if ($(this).is('.disabled')) {
				return false;
			}

		// slide panels
			return scrollToPanel(
				containerEl   = $(this).getSliderContainer(),
				newPanelIndex = $(containerEl).data('currentPanel') + 1,
				doAnimation = true,
				doAdjustments
			);
	};


	/**
	 * Scroll to the specified panel. Either with or without animated scrolling.
	 */
	scrollToPanel = function (containerEl, newPanelIndex, /* optional */ doAnimation, /* optional */ doAdjustments) {

		// get all panels
			panels = $(containerEl).find('.'+$.compact.slider.conf.panelClass);

		// check to ensure newPanelIndex is within bounds, otherwise bail!
			if (newPanelIndex < 0 || newPanelIndex+$(containerEl).data('numPanelsDisplayed') > panels.size()) {
				// Update controls so user knows they have reached the end
					updateControlStates(containerEl);
				// bail!
					return false;
			}

		// set defaults for optional arguments
			doAnimation = (typeof doAnimation == 'undefined')? true : doAnimation ;
			doAdjustments = (typeof doAdjustments == 'undefined')? true : doAdjustments ;

		// get options
			options = $(containerEl).data('options');

		// find slider element
			sliderEl = $(containerEl).find('.'+$.compact.slider.conf.sliderElClass);

		// scroll!
			if (doAnimation) {
				// animate to new 'left' position
					sliderEl.stop().animate({left : - (panels.eq(newPanelIndex).position().left)}, options.animationDuration);
			} else {
				// no animation, just set 'left' propery
					sliderEl.stop().css('left', - (panels.eq(newPanelIndex).position().left));
			}

		// update current data variables
			$(containerEl).data('currentPanel', newPanelIndex);

		// update cookie
			updateCurrentPanelCookie(containerEl, newPanelIndex);

		if (doAdjustments) {
			// adjust dimensions and update control states
				adjustSlidingPanels.apply(containerEl);
		}

		return true;
	};

	updateCurrentPanelCookie = function (containerEl, newPanelIndex) {
		// init
			cookieRef = $.compact.slider.conf.cookieRefPrefix+$(containerEl).attr('id')+'.current';

		// get options
			options = $(containerEl).data('options');

		// has the value changed?
			if ($.compact._cookie(cookieRef) != newPanelIndex) {

				$.compact._cookie(
					cookieRef,
					newPanelIndex+'',
					{expires : options.cookieExpiryDays}
				);
			}
	};


	$.fn.getSliderContainer = function () {
		return $(this).parents($.compact.slider.conf.containerSelector+':first');
	};

})(jQuery); /* end closure */