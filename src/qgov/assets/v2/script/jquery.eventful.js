/**
 * jQuery functions and plugins for adding Google Analytics event tracking throughout a page.
 * Uses the new 'asynchronous' GA tracking syntax.
 * 
 * jquery.eventful.js
 * @version 0.3
 * Changelog:
 *   *  0.1 Initial implementation.
 *   *  0.2 Ironed out bugs with GA call (thanks bboyle). Added delay on default behaviours so GA has time to phone home before navigating away.
 *   *  0.3 Added support for GA tracker namespaces (provides the ability to track with more than one code at once).
 *
 * @author Andrew Ramsden <http://irama.org/>
 * @see http://irama.org/web/dhtml/eventful/
 * @license GNU GENERAL PUBLIC LICENSE (GPL) <http://www.gnu.org/licenses/gpl.html>
 * 
 * @requires jQuery (tested with 1.6.4) <http://jquery.com/>
 * @requires jquery.url.js (tested with 2.0) <https://github.com/irama/jQuery-URL-Parser>
 * @requires jquery.accessibleText.js <https://github.com/Forces/usetheforces-accessibleText>
 * 
 * 
 * Use trackEvent plugin to add tracking to elements. For example:
 *     $('a').trackEvent('click', 'links' ...) // track clicks on links element
 * 
 * Generally: Start with the most specific rules, then get broader. Leave boolStack as 
 * default (false), then each element/evt is only ever tracked once. For example:
 *     $('a[href^="http://"google.com]').trackEvent('click', 'google-links') // track links to Google
 *     $('a[href^="http://"]').trackEvent('click', 'external-links') // track all other external links
 */


(function( $ ) {// start closure
	'use strict';


	// internal functions
	var _trackAnEvent, _reTriggerEventDefault;


	jQuery.eventful = ( typeof jQuery.eventful !== 'undefined' ) ? jQuery.eventful : {};
	jQuery.eventful.debugMode = ( typeof jQuery.eventful.debugMode !== 'undefined' ) ? jQuery.eventful.debugMode : false;
	jQuery.eventful.internalSites = [ window.location.protocol + '//' + window.location.hostname ];
	jQuery.eventful.tempNode = null;
	jQuery.eventful.gaTrackerNamespace = '';
	//jQuery.eventful.internalSitesSelector = 'a[href^="'+jQuery.eventful.internalSites[0]+'"], form[target^="'+jQuery.eventful.internalSites[0]+'"]';


	_gaq = (typeof _gaq !== 'undefined') ? _gaq : [];


	/**
	 * Use of this function binds specified sites (protocol, domain and path) together for reporting under the same profile.
	 * 
	 * @param array sitesToGlue An array of sites to glue together. Optional, default the array currently set using setInternalSites.
	 */
	$.eventful.glueSites = function( sitesToGlue ) {

		_gaq.push(
			[ $.eventful.gaTrackerNamespace + '_setDomainName', 'none' ],
			[ $.eventful.gaTrackerNamespace + '_setAllowLinker', true ]
		);
		
		sitesToGlue = ( typeof sitesToGlue !== 'undefined' ) ? sitesToGlue : $.eventful.internalSites;
		
		$( sitesToGlue ).each(function() {
				
				var currentDomain = $.url( this ).attr( 'host' );
				
			// Bail if matching the current domain
				if ( $.url( window.location.href ).attr( 'host' ) === currentDomain ) {
					return;
				}
				
			// Glue together all links to matched domains
				$( document ).delegate( 'a[href~="' + currentDomain + '"]', 'click', function() {
					if ( $.eventful.debugMode ) {
						$.eventfulDebug( $.eventful.gaTrackerNamespace + '_link; ' + $( this ).attr( 'href' ));
					} else {
						_gaq.push( [$.eventful.gaTrackerNamespace + '_link', $( this ).attr( 'href' ) ]);
						return false;
					}
				});
			// Don't mess with forms (this causes issues)
			/*
			// Glue together all POST forms
				$( document ).delegate('form[method="post"][action^="'+this+'"]', 'submit', function(){
					if ($.eventful.debugMode) {
						$.eventfulDebug($.eventful.gaTrackerNamespace+'_linkByPost; '+$(this).attr('action'));
					} else {
						_gaq.push([$.eventful.gaTrackerNamespace+'_linkByPost', this]); return false;
					}
				});
			
			// Glue together all GET forms
				$( document ).delegate('form[action^="'+this+'"][method!="post"]', 'submit', function(){
					if ($.eventful.debugMode) {
						$.eventfulDebug($.eventful.gaTrackerNamespace+'_link; '+$(this).attr('action'));
					} else {
						_gaq.push([$.eventful.gaTrackerNamespace+'_link', $(this).attr('action')]); return false;
					}
				});
			*/
		});
		
	};

	/**
	 * This function is handy if you are using more than one tracker.
	 * Use this function to specify which tracker to send each event to.
	 *
	 * To track events with more than one tracker, use $.setTracker to switch
	 * trackers before using trackEvent() to bind event handlers for that tracker. e.g.
	 * $.eventful.setTracker('tracker1'); $('a:internal').trackEvent('click');
	 * $.eventful.setTracker('tracker2'); $('a:external').trackEvent('click');
	 * 
	 * @param array trackerID The ID of the tracker to send events to.
	 */
	$.eventful.setTracker = function( trackerID ) {	
		$.eventful.gaTrackerNamespace = trackerID + '.';
	};

	/**
	 * Use this function to establish which sites are considered 'internal' versus 'external' 
	 * for the sake of tracking under a single profile.
	 * After specifying the 'internal' sites, 'a:internal' and 'form:external' 
	 * pseudo-selectors can be used.
	 * 
	 * @param array internalSites An array of strings containing protocol, domain and path 
	 *              of the 'site' considered 'internal'. All other protocol//domain/path combos
	 *              are considered 'external'.
	 */
	$.eventful.setInternalSites = function( internalSites ) {
		$.eventful.internalSites = internalSites;
	};


	$.extend($.expr[ ':' ], {
		'internal': function( obj ) {
			var $obj = $( obj ),
				objURL;

			if ( ! $obj.is( '[href], [action], [src]' )) {
				return false;
			}
			
			if ( /^(?:javascript:|#|\.)/i.test( $obj.attr( 'href' )) ) {
				return false;
			}

			objURL = String( $obj.url() );
			$.each( $.eventful.internalSites, function( indexOfElement, currentURL ) {
				if ( objURL.substring( 0, currentURL.length ) === currentURL ) {
					return true;
				}
			});
			return false;
		},


		'external': function( obj ) {
			var $obj = $( obj ),
				objURL;
			
			if ( ! $obj.is( '[href], [action], [src]' )) {
				return false;
			}
			
			// href="javascript:" -- not external
			// href="#id" -- not external
			// href="./?param=value" -- not external
			// href="../" -- not external
			if ( /^(?:javascript:|#|\.)/i.test( $obj.attr( 'href' )) ) {
				return false;
			}

			objURL = String( $obj.url() );
			$.each( $.eventful.internalSites, function( indexOfElement, currentURL ) {
				if ( objURL.substring( 0, currentURL.length ) === currentURL ) {
					return false;
				}
			});
			return true;
		}
	});


	/**
	 * Internal function for tracking an event.
	 * Don't use this function directly, use $(this).trackEvent() plugin to add event tracking.
	 * 
	 * For normal events (the naturally triggered event), prevent the default
	 * behaviour and ping Google instead. For the follow action, allow the Default
	 * after a delay.
	 */
	_trackAnEvent = function( evtObj ) {
		var evtTarget, action, targetIndex, category, label, value, sourceURL, thisURL, similarLinks, similarForms,
			$this = $( this );
		
		// if tempNode is set, don't do anything else, just return and let the default behaviour kick in
			if ( $.eventful.tempNode !== null ) {
				$.eventful.tempNode = null;
				//console.log('allowing default');
				return true;
			}
		
		//console.log('evt started');
		
		evtTarget = '';
		
		if ( evtObj.data.action !== null ) {
			action = evtObj.data.action;

		} else { // generate a unique reference for this action
			targetIndex = '';
			switch ( evtObj.target.nodeName.toUpperCase() ) {
				case 'A':
					sourceURL = this.href;
					thisURL = $this.url();
					evtTarget = thisURL;
					
					if (sourceURL === '#') {
						evtTarget = $this.accessibleText();
					} else if ( this.id !== '' ) {
						evtTarget = '(#' + this.id + ') ' + thisURL;
					} else { // prepend a unique index for this link
						similarLinks = $( 'a[href="'+sourceURL+'"], a[href="' + thisURL + '"]' );
						if ( similarLinks.length > 1 ) {
							evtTarget = '(' + ( similarLinks.index( evtObj.target ) + 1 ) + '/' + similarLinks.length + ') ' + thisURL;
						}
					}
				break;
				case 'FORM':
					sourceURL = $this.attr( 'action' );
					thisURL = $this.url();
					evtTarget = thisURL;
					
					if ( this.id !== '' ) {
						evtTarget = '(#' + this.id + ') ' + thisURL;
					} else { // prepend a unique index for this link
						similarForms = $( 'form[action="' + sourceURL + '"], form[action="' + thisURL + '"]' );
						if ( similarForms.length > 1 ) {
							evtTarget = '(' + ( similarForms.index( evtObj.target ) + 1 ) + '/' + similarForms.length + ') ' + thisURL;
						}
					}
				break;
				default:
					evtTarget = $this.accessibleText(); // works for all elements (e.g. 'p', or 'input[type=submit]')
				break;
			}
			action = evtObj.type + ': ' + evtTarget;
		}
		
		category = evtObj.data.category; 
		label = ( evtObj.data.label !== null ) ? label : 'On page: ' + window.location.href;
		value = evtObj.data.value;

		// debugging?
		if ( $.eventful.debugMode ) {

			$.eventfulDebug( evtObj.data.tracker + '_trackEvent; category: ' + category + '; action: ' + action + '; label: ' + label + '; value: ' + value + ';' ); // return false;

		} else {
			// Ping Google
			_gaq.push( [ evtObj.data.tracker + '_trackEvent', category, action, label, value, true ] );

			// for links with @href
			if ( evtObj.href ) {
				// do not follow link (need time to ping google)
				evtObj.preventDefault();
				evtObj.stopPropagation();
				
				// go direct to URL after timeout
				setTimeout( function() {
					window.location.href = evtObj.href;
				}, 200 );
			}
		}
	};


	/**
	 * An internal function used to retrigger the native default behaviours for an
	 * element we are tracking.
	_reTriggerEventDefault = function() {
		var evtObj = $.eventful.tempNode,
			target = $( evtObj.target )[ 0 ];

			//console.log (evtObj.type);
		//$(evtObj.target).trigger(evtObj.type, [allowDefault=true]);
		if ( typeof target[ evtObj.type ] !== 'undefined' ) {
			target[ evtObj.type ](); // trigger native behaviours
		} else {
			target.click(); // For Chrome
		}
	};
	 */


	/**
	 * Use this plugin to add event tracking to an element.
	 * 
	 * @param string events The event(s) to track. e.g. 'hover click' or 'submit'.
	 * @param String category The GA 'category' for an event.
	 * @param String action The GA 'action' for an event. Optional, default '{evt}: (#id {or} 1/2) href/action'. Leave unset, or set to null to accept default.
	 * @param String label The GA 'label' for an event. Optional, default 'On page: {Current page URL}'. Leave unset, or set to null to accept default.
	 * @param String value The GA 'value' for an event. Optional, default ''.  Leave unset, or set to null to accept default.
	 * @param Boolean boolStack If false, this rule will be only be applied if no other tracking rule already exists for this element/evt combo. Optional, default false.
	 */
	$.fn.trackEvent = function( events, category, action, label, value, boolStack ) {
		
		
		$( this ).each(function() {
			var tracking, boolStack, action, label, value,
				$this = $( this );
			
			//liveSelector = $(this).selector;
			
			//$.debug('tracking: '+category);
			
			// TODO: check for pre-existing tracking independently when 'events' contains multiple events e.g. 'hover click'.
			// Get previous tracking info
				tracking = $this.data( 'eventful' );
				if ( typeof tracking === 'undefined' ) {
					tracking = {};
				}
				if ( typeof tracking === 'object' && typeof tracking[ events ] === 'undefined' ) {
					tracking[events] = '';
				}
			
			// if not stacking, check if this element/event is already being tracked
				boolStack = ( typeof boolStack !== 'undefined' ) ? boolStack : false;
				if ( ! boolStack && tracking[ events ] !== '' ) {
					return; // Don't stack a new tracker, just return
				}
			
			// Init default values
				action = ( typeof action === 'undefined' || action === null ) ? null : action;
				label = ( typeof label === 'undefined' || label === null ) ? null : label;
				value = ( typeof value === 'undefined' || value === null ) ? null : value;
			
			// Add event tracker
				$this.bind( events, {
					'category' : category,
					'action'   : action,
					'label'    : label,
					'value'    : value,
					'tracker'  : $.eventful.gaTrackerNamespace
				}, _trackAnEvent );
			
			//$.eventfulDebug(this);
			
			if ( $.eventful.debugMode ) {
				// flag with category (handy for debugging)
					$this.addClass( 'tracking-' + category );
			}
			
			// record for later
				tracking[ events ] = 'tracked';
				$this.data( 'eventful', tracking[ events ]);

		});
	};


	$(function() {
		if ( $.eventful.debugMode ) { // block all links and form submissions while in debugMode
			$( document )
			.delegate( 'a', 'click', function() { return false; })
			.delegate( 'form', 'submit', function() { return false; });
		}
	});
	$.eventfulDebug = function( message ) {
		$.debug( message );
	};


}( jQuery )); /* end closure */
