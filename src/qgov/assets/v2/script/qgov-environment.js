/*globals TEST*/

if (!String.prototype.contains) {
    String.prototype.contains = function (arg) {
        'use strict';
        return !!~this.indexOf(arg);
    };
}

// globals
var qg = { oldIE: false },
	_gaq = _gaq || []
;

// init environment for this hostname
qg.swe = (function() {
	'use strict';

    var getAssetsPath = function () {
        /*
        var result = '/assets/v2/';
        var hostname = window.location.hostname.toString();
        var parser = document.createElement('a');
        parser.href = document.getElementById( 'qgov-environment' ).getAttribute( 'src' );

        if ( hostname.contains('beta') || ( hostname !== parser.hostname ) ) {
            //result = 'http://qld-beta.ssq.qld.gov.au/assets/v2/';
            result = parser.hostname.replace( 'beta-v2', 'v2' ).replace( parser.hostname, hostname );
            console.log(result);
        } else {
            result = parser.href.replace( /\/assets\/([^\/]*v\d+[^\/]*)\/.*$/, '/assets/$1/' );
        }
        return result;
        */
        return document.getElementById( 'qgov-environment' ).getAttribute( 'src' ).replace( /\/assets\/([^\/]*v\d+[^\/]*)\/.*$/, '/assets/$1/' );
    };

	var productionSites = [
			// production sites are sorted by traffic to return matches faster
			'smartjobs.qld.gov.au',
			'qld.gov.au',
			'smartjobs.govnet.qld.gov.au',
			'find.search.qld.gov.au',
			'smartservice.qld.gov.au',
			'secure.communities.qld.gov.au',
			'service.transport.qld.gov.au',
			'getinvolved.qld.gov.au',
			'data.qld.gov.au',
			'publications.qld.gov.au',
			'bookings.qld.gov.au',
			'bdm.qld.gov.au',
			'qldalert.com',
			'account.qld.gov.au',
			'identity.qld.gov.au',
			'jobs.govnet.qld.gov.au',
			'jobs.qld.gov.au',
			'secure.communities.govnet.qld.gov.au',
			'secure.housing.qld.gov.au',
			'environment.ehp.qld.gov.au',
			'recreation.nprsr.qld.gov.au',
			'police.qld.gov.au',
			'blarga.communities.qld.gov.au',
			'fairtrading.qld.gov.au',
			'translate.googleusercontent.com',
			'webcache.googleusercontent.com',
			'nras.communities.qld.gov.au',
			'queenslandplan.qld.gov.au',
			'business.qld.gov.au' // Remember: no trailing comma!
		],

		testSites = [
			'qld-dev.ssq.qld.gov.au',
			'qld-beta.ssq.qld.gov.au',
			'qld-uat.ssq.qld.gov.au',
			'test.smartservice.qld.gov.au',
			'localhost' // Remember: no trailing comma!
		],


		// check productionSites against hostname
		isProduction = function( hostname ) {
			var i;

			for ( i = 0; i < productionSites.length; i++ ) {
				if ( productionSites[ i ] === hostname.toLowerCase() || 'www.' + productionSites[ i ] === hostname.toLowerCase() ) {
					return true;
				}
			}
			return false;
		},


		// SWE object
		swe = {

			paths: {
				// assets path (for current environment, based on current script#qgov-environment@src path)
				assets : getAssetsPath()
			},

			// proxy functions for loader
			load: function( funcData ) {
				var q;
				if ( typeof this[ funcData.name ] !== 'function' ) {
					// store queue on swe.load.<functionName>
					this.load[ funcData.name ] = funcData;
					q = this.load[ funcData.name ].q = this.load[ funcData.name ].q || [];
					// swe.<functionName> placeholder function
					this[ funcData.name ] = function() {
						q.push( arguments );
					};
					this[ funcData.name ]._proxy = true;
				}
			},

			isProduction: isProduction( window.location.hostname ),

			isTablet: false,
			isMobile: true // mobile first!
		}
	;


	swe.GATracker = 'qgo';
	if ( swe.isProduction ) {
		// Specify GA queue, account and tracker
		swe.GAAccount = 'UA-7276966-1';
		// Specify 'internal' sites (used to glue domains together for Google Analytics)
		swe.internalSites = productionSites;

	} else {
		// Specify GA queue, account and tracker
		swe.GAAccount = 'UA-7276966-10';
		// Specify 'test' sites (used to glue domains together for Google Analytics)
		swe.internalSites = testSites;
	}


	// TEST API
	if ( TEST ) {
		swe.TEST_ENVIRONMENT = {};
		swe.TEST_ENVIRONMENT.isProduction = isProduction;
	}


	// return object
	return swe;

}());
