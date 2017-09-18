// TODO this script should be retired. Use HTML5 @placeholder instead.
// refactor this script to set placeholder attributes?

/**
 * "Compact form labels" plugin (Allows labels positioned over form inputs to be hidden when field is focussed or populated)
 * Based on ideas from <http://www.alistapart.com/articles/makingcompactformsmoreaccessible/>
 * jquery.compact-form-labels.js
 * @version 0.1
 * Changelog:
 *   *  0.1 Initial implementation
 *
 * @author Andrew Ramsden
 * @see http://irama.org/web/dhtml/compact-form-labels/
 * @license GNU GENERAL PUBLIC LICENSE (GPL) <http://www.gnu.org/licenses/gpl.html>
 * 
 * @requires jQuery (tested with 1.3.1) <http://jquery.com/>
 * 
 */
jQuery.cFormLabelsConf = {
	inputSelector     : ':input',
	labelSelector     : 'label',
	compactLabelClass : 'compact-label',
	hiddenLabelClass  : 'visuallyhidden'
};

(function( $ ) {// start closure
	'use strict';


	var initCompactLabel,
		handleFocusBlurCompactLabelInput
	;
	
	
	/**
	 * Can be sent DOMNodes that are form inputs or labels
	 */
	$.fn.compactFormLabel = function( options ) {
		var inputId;
		options = options || {};
		$(this).filter($.cFormLabelsConf.inputSelector+', '+$.cFormLabelsConf.labelSelector).each(function () {
			if ($(this).is($.cFormLabelsConf.inputSelector)) {
				initCompactLabel(this);
			} else {
				inputId = $(this).attr('for');
				if (typeof inputId === 'undefined') {
					$.debug('DEBUG: Each "label" must have a "for" attribute that references the input it is labelling');
					return;
				}
				initCompactLabel('#'+inputId);
			}
		});
		
		return $(this); // facilitate chaining
	};
	
	/**
	 * Find the label associated with a form input
	 */
	$.fn.findLabel = function () {
		var inputId = $(this).attr('id'),
			labelEl
		;

		if (typeof inputId === 'undefined') {
			$.debug('DEBUG: Cannot find "label" for input element that doesn\'t have a unique "id" attribute');
			return null;
		}
		labelEl = $($.cFormLabelsConf.labelSelector+'[for="'+inputId+'"]');
		if (labelEl.length === 0) {
			$.debug('DEBUG: No "label" element found for the input with id "'+inputId+'" ');
			return null;
		}
		return labelEl;
	};
	
	/**
	 * initCompactLabel expects an input DOMNode
	 */
	initCompactLabel = function( inputEl ) {
		
		// find label
		var labelEl = $(inputEl).findLabel();
			
		// add compact class
		labelEl.addClass($.cFormLabelsConf.compactLabelClass);
		
		// add handlers to input
		$(inputEl).bind('focus blur', handleFocusBlurCompactLabelInput);
		
		// hide label if input is populated
		$(inputEl).triggerHandler('blur');
	};
	

	handleFocusBlurCompactLabelInput = function( eventObj ) {
		// find label
		var labelEl = $(this).findLabel();
		
		// hide label if input is populated
		// In terms of accessibility, it is important that the CSS for this hiddenLabelClass
		// be used to hide the label visually but NOT semantically. One option is to give the 
		// label dimensions of 0 and overflow:hidden. Another option is to position the label offscreen.
		if (eventObj.type === 'focus' || $(this).val() !== '') {
			labelEl.addClass($.cFormLabelsConf.hiddenLabelClass);
		} else {
			labelEl.removeClass($.cFormLabelsConf.hiddenLabelClass);
		}
	};
	
	
}( jQuery )); /* end closure */
