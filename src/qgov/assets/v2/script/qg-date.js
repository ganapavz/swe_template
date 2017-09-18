/*globals qg*/
qg.date = (function() {
	'use strict';


	var datePackage = {},

		// Public holiday dates for 2010-2014 (viewed 2012-09-28)
		// http://www.justice.qld.gov.au/fair-and-safe-work/industrial-relations/public-holidays/dates
		qldHolidays = {
			// 2010
			'2010-01-01' : 'New Year’s Day',
			'2010-01-26' : 'Australia Day',
			'2010-04-02' : 'Good Friday',
			'2010-04-03' : 'Easter Saturday',
			'2010-04-05' : 'Easter Monday',
			'2010-04-26' : 'Anzac Day',
			'2010-05-03' : 'Labour Day',
			'2010-06-14' : 'Queen’s Birthday',
			'2010-12-25' : 'Christmas Day',
			'2010-12-27' : 'Boxing Day',
			'2010-12-28' : 'Christmas Day holiday',

			// 2011
			'2011-01-01' : 'New Year’s Day',
			'2011-01-03' : 'New Year’s Day holiday',
			'2011-02-26' : 'Australia Day',
			'2011-04-22' : 'Good Friday',
			'2011-04-23' : 'Easter Saturday',
			'2011-04-25' : 'Anzac Day',
			'2011-04-26' : 'Easter Monday',
			'2011-05-02' : 'Labour Day',
			'2011-06-13' : 'Queen’s Birthday',
			'2011-12-25' : 'Christmas Day',
			'2011-12-26' : 'Boxing Day',
			'2011-12-27' : 'Christmas Day holiday',

			// 2012
			'2012-01-01' : 'New Year’s Day',
			'2012-01-02' : 'New Year’s Day holiday',
			'2012-02-26' : 'Australia Day',
			'2012-04-06' : 'Good Friday',
			'2012-04-07' : 'Easter Saturday',
			'2012-04-09' : 'Easter Monday',
			'2012-04-25' : 'Anzac Day',
			'2012-05-07' : 'Labour Day',
			'2012-06-11' : 'Queen’s Diamond Jubilee',
			'2012-10-01' : 'Queen’s Birthday',
			'2012-12-25' : 'Christmas Day',
			'2012-12-26' : 'Boxing Day',

			// 2013
			'2013-01-01' : 'New Year’s Day',
			'2013-01-28' : 'Australia Day holiday',
			'2013-03-29' : 'Good Friday',
			'2013-03-30' : 'Easter Saturday',
			'2013-04-01' : 'Easter Monday',
			'2013-04-25' : 'Anzac Day',
			'2013-06-10' : 'Queen’s Birthday',
			'2013-10-07' : 'Labour Day',
			'2013-12-25' : 'Christmas Day',
			'2013-12-26' : 'Boxing Day',

			// 2014
			'2014-01-01' : 'New Year’s Day',
			'2014-01-27' : 'Australia Day holiday',
			'2014-04-18' : 'Good Friday',
			'2014-04-19' : 'Easter Saturday',
			'2014-04-21' : 'Easter Monday',
			'2014-04-25' : 'Anzac Day',
			'2014-06-09' : 'Queen’s Birthday',
			'2014-10-06' : 'Labour Day',
			'2014-12-25' : 'Christmas Day',
			'2014-12-26' : 'Boxing Day',

			// 2015
			'2015-01-01' : 'New Year’s Day',
			'2015-01-26' : 'Australia Day holiday',
			'2015-04-03' : 'Good Friday',
			'2015-04-04' : 'Easter Saturday',
			'2015-04-06' : 'Easter Monday',
			'2015-04-25' : 'Anzac Day',
			'2015-06-08' : 'Queen’s Birthday',
			'2015-10-05' : 'Labour Day',
			'2015-12-25' : 'Christmas Day',
			'2015-12-26' : 'Boxing Day',
			'2015-12-28' : 'Boxing Day holiday',

			// 2016
			'2016-01-01' : 'New Year’s Day',
			'2016-01-26' : 'Australia Day holiday',
			'2016-03-25' : 'Good Friday',
			'2016-03-26' : 'Easter Saturday',
			'2016-03-28' : 'Easter Monday',
			'2016-04-25' : 'Anzac Day',
			'2016-06-13' : 'Queen’s Birthday',
			'2016-10-03' : 'Labour Day',
			'2016-12-25' : 'Christmas Day',
			'2016-12-27' : 'Christmas Day holiday',
			'2016-12-26' : 'Boxing Day',

			// 2017
			'2017-01-01' : 'New Year’s Day',
			'2017-01-02' : 'New Year’s Day holiday',
			'2017-01-26' : 'Australia Day holiday',
			'2017-04-14' : 'Good Friday',
			'2017-04-15' : 'Easter Saturday',
			'2017-04-17' : 'Easter Monday',
			'2017-04-25' : 'Anzac Day',
			'2017-06-12' : 'Queen’s Birthday',
			'2017-10-02' : 'Labour Day',
			'2017-12-25' : 'Christmas Day',
			'2017-12-26' : 'Boxing Day',

			// 2018
			'2018-01-01' : 'New Year’s Day',
			'2018-01-26' : 'Australia Day holiday',
			'2018-03-30' : 'Good Friday',
			'2018-03-31' : 'Easter Saturday',
			'2018-04-02' : 'Easter Monday',
			'2018-04-25' : 'Anzac Day',
			'2018-05-07' : 'Labour Day',
			'2018-10-01' : 'Queen’s Birthday',
			'2018-12-25' : 'Christmas Day',
			'2018-12-26' : 'Boxing Day',

			// 2019
            '2019-01-01' : 'New Year’s Day',
            '2019-01-26' : 'Australia Day holiday',
            '2019-04-19' : 'Good Friday',
            '2019-04-20' : 'Easter Saturday',
            '2019-04-22' : 'Easter Monday',
            '2019-04-25' : 'Anzac Day',
            '2019-05-06' : 'Labour Day',
            '2019-06-10' : 'Queen’s Birthday',
            '2019-12-25' : 'Christmas Day',
            '2019-12-26' : 'Boxing Day'
		}
	;


	// is a public holiday
	datePackage.isPublicHoliday = function( date ) {
		var d = date.getDate(),
			m = date.getMonth() + 1,
			y = String( date.getFullYear() ),
			dateString = y + ( m < 10 ? '-0' : '-' ) + m + ( d < 10 ? '-0' : '-' ) + d
		;

		// return true, date is a public holiday
		// TODO, if not a state-wide public holiday and given a latlong, check if it is a show holiday
		// return false, date is not a public holiday
		// TODO
		// return undefined, it is not known if the date is a public holiday (beyond 2 years in the future?)

		return !! qldHolidays[ dateString ];
	};


	return datePackage;

}());
