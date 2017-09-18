/*globals qg*/
( function ( $, qg ) {
	'use strict';

	// ************** Code outline **********
	// ************** Needs proper implementation of methods and testing **********

	function setDefaultParameter( inputVal, defVal ) {
		// Checks and sets the default value for a parameter if they haven't been supplied
		// Parameters
		// inputVal - REQUIRED.  The input value to check
		// defVal - REQUIRED - may be a null string.  The default value to return, if the inputVal fails it's check.
		if ( ( inputVal === undefined ) || ( inputVal === null ) || ( inputVal === '' ) ) {
			return defVal;
		} else {
			return inputVal;
		}
	}

	function setUpdateInterval( displayType ) {
		// Sets the update time interval based on the display type of hours, minutes or sections
		// Parameters
		// displayType - REQUIRED.  Accepts 'h', 'm' or 's'.  Sets what to display, hours (h),  hours and minutes(m) or hours, minutes and seconds (s)

		switch ( displayType ) {
		case 'h':
			return 3600000;
		case 's':
			return 1000;
		default:
			// Default is minutes
			return 60000;
		}
	}

	function padUnderTen( inVal ) {
		// Takes the input value and checks if it's less than ten, and if so returns it padded with a leading zero
		// Parameters
		// inVal - REQUIRED.  The value to check for if it's less than 10

		if ( inVal < 10 ) {
			return '0' + inVal;
		} else {
			return inVal;
		}
	}

	function setReturnVals( displayType, hours, minutes, seconds, timerDisplay ) {
		// Formats a return string using just the specified hours, minutes or seconds
		// Parameters
		// displayType - REQUIRED.  What to display, can be 'h' (hours), 'm' (hours:minutes) or 's' (hours:minutes:seconds) - default return is always 'm'
		// hours - REQUIRED.  The hours to display
		// minutes - REQUIRED.  The minutes to display
		// seconds - REQUIRED.  The seconds to display
		// timerDisplay - REQUIRED.  The type of display, pass through true to display as a timer not as text

		if ( timerDisplay ) {
			switch ( displayType ) {
			case 'h':
				return padUnderTen( hours ) + '<em>h</em>';
			case 's':
				return padUnderTen( hours ) + '<em>h</em>' + ':' + padUnderTen( minutes ) + '<em>m</em>' + ':' + padUnderTen( seconds ) + '<em>s</em>';
			default:
				// Default is minutes
				return padUnderTen( hours ) + '<em>h</em>' + ':' + padUnderTen( minutes ) + '<em>m</em>';
			}
		} else {
			switch ( displayType ) {
			case 'h':
				return '(' + hours + ' hour' + ( hours === 1 ? '' : 's' ) + ' remaining)';
			case 's':
				return '(' + hours + ' hour' + ( hours === 1 ? '' : 's' ) + ', ' + minutes + ' minute' + ( minutes === 1 ? '' : 's' ) + ', ' + seconds + ' second' + ( seconds === 1 ? '' : 's' ) + ' remaining)';
			default:
				// Default is minutes
				return '(' + hours + ' hour' + ( hours === 1 ? '' : 's' ) + ', ' + minutes + ' minute' + ( minutes === 1 ? '' : 's' ) + ' remaining)';
			}
		}
	}

	function setTargetDate( countTime ) {
		var hours, minutes, seconds, remainder;
		var tempDate = new Date();

		remainder = countTime;
		hours = parseInt( remainder / 3600, 10 );
		remainder = remainder % 3600;
		minutes = parseInt( remainder / 60, 10 );
		seconds = parseInt( remainder % 60, 10 );

		tempDate.setHours( tempDate.getHours() + hours );
		tempDate.setMinutes( tempDate.getMinutes() + minutes );
		tempDate.setSeconds( tempDate.getSeconds() + seconds );

		return tempDate;
	}

	function initiateTimer( insertWhere, countTime, endFunction, displayType, timeWarn, timeOutText, wrapperText ) {
		// Inserts a countdown element into a pre defined placeholder on the page
		// Pre condition - and element on the page with the id provided exists on the page
		// Post condition - A countdown element is created, along with a timer object to update the countdown
		// Parameters
		// insertWhere - REQUIRED.  The id of the element to insert the timer into.
		// countTime - REQUIRED.  The number of seconds remaining at the call of the function.
		// endFunction - Optional.  The function to call when the timer object runs out.
		// displayType - Optional.  Accepts 'h', 'm' or 's'.  Sets what to display, hours (h),  hours and minutes(m) or hours, minutes and seconds (s) - default is 'm'
		// timeWarn - Optional.  A time to change the display element to a warning display type - in seconds.  Default - none.
		// timeOutText - Optional.  Text to display when the time runs out.  Default - 'Out of time'
		// wrapperText - Optional.  Any text to insert before the timer object.  Default - empty string.

		// Check for required parameters
		if ( ( insertWhere === undefined ) || ( insertWhere === null ) || ( insertWhere === '' ) ) {
			return 'invalid insert element';
		}
		if ( ( countTime === undefined ) || ( countTime === null ) || ( countTime === '' ) ) {
			return 'invalid timer value';
		}

		// Check and set the default values.
		endFunction = setDefaultParameter( endFunction, '' );
		displayType = setDefaultParameter( displayType, 'm' );
		timeWarn = setDefaultParameter( timeWarn, 0 );
		timeOutText = setDefaultParameter( timeOutText, 'Out of time' );
		wrapperText = setDefaultParameter( wrapperText, '' );

		// Get a handle on the insert placeholder
		var placeholder = document.getElementById( insertWhere );

		if ( placeholder !== undefined && placeholder !== null ) {
			// remove any existing counters
			$( '.countdownTimerTime,.countdownTimerClock,.countdownTimerCounter', placeholder ).remove();

			// Set up the elements for the counter
			var timeEl = document.createElement( 'time' );
			var timeSpan = document.createElement( 'span' );
			timeEl.className = 'countdownTimerTime';

			// And the elements for the timer
			var updateInterval = setUpdateInterval( displayType );
			var hours, minutes, seconds;
			var targetDate = setTargetDate( countTime );
			var timeOutMaker;

			// Check for which display type the countdown should use
			var timerDisplay = jQuery( placeholder ).hasClass( 'timerClock' );

			// Insert the elements onto the page
			if ( !timerDisplay ) {
				timeEl.setAttribute( 'datetime', targetDate.getUTCFullYear() + '-' + padUnderTen( targetDate.getUTCMonth() + 1 ) + '-' + padUnderTen( targetDate.getUTCDate() ) + 'T' + padUnderTen( targetDate.getUTCHours() ) + ':' + padUnderTen( targetDate.getUTCMinutes() ) + ':' + padUnderTen( targetDate.getUTCSeconds() ) + 'Z' );
				var timeText = document.createTextNode( qg.swe.template.format( targetDate, 'datetime' ));
				timeEl.appendChild( timeText );
				timeSpan.className = 'countdownTimerCounter';
			} else {
				timeSpan.className = 'countdownTimerClock';
			}

			// check to see if the text is in a paragraph
			var childP = placeholder.getElementsByTagName( 'p' );
			if ( ( childP[ 0 ] !== null ) && ( childP[ 0 ] !== undefined ) ) {
				childP[ 0 ].innerHTML = '';
				childP[ 0 ].appendChild( timeEl );
			} else {
				placeholder.innerHTML = '';
				placeholder.appendChild( timeEl );
			}
			if ( wrapperText !== '' ) {
				var wrapEl = document.createTextNode( wrapperText );
				placeholder.appendChild( wrapEl );
			}
			placeholder.appendChild( timeSpan );

			var updateIntervalFunction = function () {
				var currentDate = new Date().getTime();
				var secondsLeft = ( targetDate - currentDate ) / 1000;
				var warnPast = false;
				var warnDate, warnSeconds;
				var spanEl;

				// Calculate when the warning date should be
				if ( timeWarn !== 0 ) {
					warnDate = setTargetDate( timeWarn );
					warnSeconds = ( warnDate - currentDate ) / 1000;
					if ( warnSeconds > secondsLeft ) {
						warnPast = true;
						displayType = 's';
						updateInterval = setUpdateInterval( displayType );
					}
				}

				var retString;

				hours = parseInt( secondsLeft / 3600, 10 );
				// use modulus (remainder) division to determine the number of seconds that are remaining
				secondsLeft = secondsLeft % 3600;

				// Now minutes, and then the remainder is the seconds
				minutes = parseInt( secondsLeft / 60, 10 );
				seconds = parseInt( secondsLeft % 60, 10 );

				// Check to see if the time has elapsed
				var insObj;
				if ( ( hours <= 0 ) && ( minutes <= 0 ) && ( seconds <= 0 ) ) {
					// Time has elapsed
					insObj = document.createTextNode( ' ' + timeOutText );
					timeSpan.innerHTML = '';
					spanEl = document.createElement( 'span' );
					spanEl.className = 'timeWarning';
					spanEl.appendChild( insObj );
					timeSpan.appendChild( spanEl );
					timeSpan.className = '';

					// Call the return function if specified
					if ( typeof endFunction === 'function' ) {
						endFunction();
					}
				} else {
					// Create a new string compiling the time
					retString = setReturnVals( displayType, hours, minutes, seconds, timerDisplay );

					//insObj = document.createTextNode(wrapperText + ' ' + retString);

					// Check to make sure that the warning time hasn't passed
					if ( warnPast ) {
						// Hit the warning time, wrap the return string in a span with a timeWarning class
						spanEl = document.createElement( 'span' );
						spanEl.className = 'timeWarning';
						spanEl.innerHTML = retString;
						timeSpan.innerHTML = '';
						timeSpan.appendChild( spanEl );
					} else {
						timeSpan.innerHTML = '';
						timeSpan.innerHTML = retString;
					}
				}
				// Clean up the timer element, and then re-call
				clearTimeout(timeOutMaker);
				timeOutMaker = setTimeout(updateIntervalFunction, updateInterval);
			};
			// run once
			updateIntervalFunction();
		} else {
			return 'invalid insert element';
		}
	}

	// API
	qg.swe.countdownTimer = function ( config ) {
		initiateTimer( config.insertWhere, config.countTime, config.endFunction, config.displayType, config.timeWarn, config.timeOutText, config.wrapperText );
	};

}( jQuery, qg ) );
