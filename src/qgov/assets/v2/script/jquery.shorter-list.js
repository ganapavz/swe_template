/**
 * "Shorter list" plugin
 * jquery.shorter-list.js
 * @version 0.4
 * Changelog:
 *   *  0.1 Initial implementation
 *   *  0.2 Tweaks to allow different styling for expanded and collapsed states, and active state.
 *   *  0.3 Improved animation using a vieport container. Added ARIA roles and states/properties.
 *   *  0.4 Added useSimpleAnimation option for long lists that don't perform well in some browsers with the complex animation.
 *
 * @author Andrew Ramsden
 * @see http://irama.org/web/dhtml/shorter-list/
 * @license GNU GENERAL PUBLIC LICENSE (GPL) <http://www.gnu.org/licenses/gpl.html>
 *
 * @requires jQuery (tested with 1.3.1) <http://jquery.com/>
 * @requires jQuery jARIA plugin <http://outstandingelephant.com/jaria/>
 *
 */
jQuery.sList = {};

jQuery.sList.conf = {
	containerClass : 'short-list',
	viewportClass  : 'viewport',
	toggleClass    : 'toggle',
	activeClass    : 'active',
	expandedClass  : 'expanded'
};


jQuery.sList.defaultOptions = {
	howShort           : 5, // how many list items to display before truncating?
	toggleShowText     : 'Show all',
	toggleHideText     : 'Show less',
	toggleShowTitle    : '',
	toggleHideTitle    : '',
	useSimpleAnimation : false // some really long lists perform poorly with the complexity of the normal animation, give option to simplify for those situations.
};


(function($) {// start closure


	/**
	 * Expects to be sent DOMNodes that are ul or ol elements
	 */
	$.fn.shorterList = function (options) {
		options = options || {};

		$(this).each(function () {
			initShorterList.apply(this, [options])
		});

		return $(this); // facilitate chaining
	};


	/**
	 * Expects to be sent DOMNodes that are ul or ol elements
	 */
	initShorterList = function (options) {

		// check if the right element has been sent
			if (this.nodeName != 'UL' && this.nodeName != 'OL') {
				$.debug('DEBUG: The "shorter list" plugin can only be applied to OL or UL elements');
				return;
			}

		// Merge runtime options with defaults
		// Note: The first argument sent to extend is an empty object to
		// prevent extend from overriding the default $.AKN.defaultOptions object.
			options = (typeof options == 'undefined')
				? $.sList.defaultOptions
				: $.extend({}, $.sList.defaultOptions, options)
			;

		// check if list even requires shortening
			if ($(this).find('li:gt('+(options.howShort-1)+')').size() == 0) {
				// no shortening required
					$.debug('DEBUG: The "shorter list" plugin has established that this list is short enough already! No further action will be taken');
					return;
			}

		// init
			containerEl = $('<div class="'+$.sList.conf.containerClass+'"></div>')
				.data('options', options)
				.ariaState('live', 'assertive')
				.ariaState('atomic', 'false') // only the relevant changed nodes need be presented
				//.css('overflow','hidden')
			;
			viewportEl = $('<div class="'+$.sList.conf.viewportClass+'"></div>');

			//containerEl.find('ul, ol').eq(0).css('overflow','hidden');
			toggleEl = $('<p class="'+$.sList.conf.toggleClass+'"><a href="#show-all"><span>'+options.toggleShowText+'</span></a></p>');
			toggleLink = toggleEl.find('a')
				.attr('title', options.toggleShowTitle)
				.ariaRole('button')
				.ariaState('pressed','false')
			;
			if ($(this).attr('id') != '') {
				toggleLink.ariaState('controls', $(this).attr('id'));
			}


		// add actions to toggle
			//toggleEl.click(toggleListItems);
			//toggleLink.toggle(showListItems, hideListItems);
			toggleLink.click(toggleListItems);

		// combine elements
			$(this).before(containerEl);
			viewportEl.append(this);
			containerEl.append(viewportEl);
			containerEl.append(toggleEl);

		// hide all but the specified number of list items
			$(this).find('li:gt('+(options.howShort-1)+')')
				.hide()
				.ariaState('hidden','true')
			;

		// add active class
			containerEl.addClass($.sList.conf.activeClass);
	};
	showListItems = function () {
		// init
			containerEl = $(this).parents('.'+$.sList.conf.containerClass+':first').eq(0)
				.ariaState('busy','true')
			;
			viewportEl = containerEl.find('.'+$.sList.conf.viewportClass+':first');
			options = containerEl.data('options');

		// animate transition
			if (!options.useSimpleAnimation) {
				// Quickly! hide items, measure height of ul, then show items again ...
					containerEl.find('li:gt('+(options.howShort-1)+')').show();

					newHeight = $(viewportEl).children('ul').eq(0).outerHeight(true);
					//$.debug(newHeight);
					containerEl.find('li:gt('+(options.howShort-1)+')').hide();

				// ... now animate the transition
					viewportEl.stop().animate({height: newHeight},'','',function(){
						viewportEl.css('height','auto');
					});
			}
			containerEl.find('li:gt('+(options.howShort-1)+')')
				.fadeIn(function(){
					$(this).trigger('x-height-change');
				})
				.ariaState('hidden','false')
			;

		// update states and propertis
			containerEl
				.addClass($.sList.conf.expandedClass)
				.ariaState('relevant','additions text') // elements were revealed
				.ariaState('busy','false')
			;
			$(this)
				.attr('title', options.toggleHideTitle)
				.ariaState('pressed','true')
					.find('span').text(options.toggleHideText)
			;
	};

	hideListItems = function () {
		// init
			containerEl = $(this).parents('.'+$.sList.conf.containerClass+':first').eq(0)
				.ariaState('busy','true')
			;
			viewportEl = containerEl.find('.'+$.sList.conf.viewportClass+':first');
			options = containerEl.data('options');

		// animate transition
			if (!options.useSimpleAnimation) {
				// Quickly! hide items, measure height of ul, then show items again ...
					containerEl.find('li:gt('+(options.howShort-1)+')').hide();

					newHeight = $(viewportEl).children('ul').eq(0).outerHeight(true);
					//$.debug(newHeight);
					containerEl.find('li:gt('+(options.howShort-1)+')').show();

				// ... now animate the transition
					viewportEl.stop().animate({height: newHeight},'','',function(){
						viewportEl.css('height','auto');
					});
			}
			containerEl.find('li:gt('+(options.howShort-1)+')')
				.fadeOut(function(){
					$(this).trigger('x-height-change');
				})
				.ariaState('hidden','true')
			;

		// update states and propertis
			containerEl
				.removeClass($.sList.conf.expandedClass)
				.ariaState('busy','false')
				.ariaState('relevant','removals') // elements were hidden
			;
			$(this)
				.attr('title', options.toggleShowTitle)
				.ariaState('pressed','false')
					.find('span').text(options.toggleShowText)
			;

	};

	toggleListItems = function() {
		var target = $( this ),
		    toggleState = target.data( 'shorter-list.toggle' ) || false,
		    toggleFunc = toggleState === true ? hideListItems : showListItems
		;

		toggleFunc.call( this );
		target.data( 'shorter-list.toggle', ! toggleState );
	};

})(jQuery); /* end closure */