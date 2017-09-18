
if ( ! engageSWE ) {

	// Old SmartJobs template


// Code to write the website header
document.write('<div id="headerdiv">');
document.write('<table cellpadding="0" cellspacing="0" border="0" width="100%">');
document.write('  <tr>');
document.write('    <td class="header-qglogo" rowspan="2"><a href="http://www.qld.gov.au" target="_blank"><img src="/site/images/qglogo.gif" alt="Link to Queensland Government (www.qld.gov.au)" width="140" height="50" border="0"></a></td>');
document.write('<td class="whiteblank"><img src="/site/images/spacer.gif" width="1" height="27"></td>');
document.write('    <td class="whiteblank" align="right">');
document.write('	<ul class="topnav">');
document.write('<li class="topnav"><a href="http://jobs.qld.gov.au/home.asp" accesskey="2">Home</a>&nbsp;| </li>');
document.write('<li class="topnav"><a href="http://jobs.qld.gov.au/sitemap/index.asp" accesskey="3">Site map</a>&nbsp;| </li>');
document.write('<li class="topnav"><a href="http://jobs.qld.gov.au/feedback/default.asp" accesskey="4">Contact us</a>&nbsp;| </li>');
document.write('<li class="topnav"><a href="http://jobs.qld.gov.au/help/help.asp">Help</a>&nbsp;&nbsp;&nbsp;</li>');
document.write('</ul></td>');
document.write('	</tr>');
document.write('	<tr><td class="header-agency" align="right" colspan="2"><a href="http://jobs.qld.gov.au/home.asp" title="Smart jobs and careers"><img src="/site/images/agencyname.gif" alt="Smart jobs and careers" border="0"></a></td></tr>');
document.write('  <tr><td class="lblue" colspan="3"><img src="/site/images/banner1.gif" alt="Jobs with us" width="406" height="42"></td></tr>');
document.write('</table>');
document.write('</div>');
// Top Nav - Mirroring the QLD Gov careers site, without flyouts
document.write('<div id="navdiv">');
document.write('<ul class="nav">');
document.write('<li class="nav1"><a href="/jobtools/jncustomsearch.jobsearch?in_organid=14904">Jobs with us</a>&nbsp;| </li>');
document.write('<li class="nav1"><a href="http://jobs.qld.gov.au/working/qldps.asp">Working with us</a>&nbsp;| </li>');
document.write('<li class="nav1"><a href="http://jobs.qld.gov.au/benefits/benefits.asp">Benefits</a>&nbsp;| </li>');
document.write('<li class="nav1"><a href="http://jobs.qld.gov.au/students/students_graduates.asp">Students & Graduates</a>&nbsp;| </li>');
document.write('<li class="nav1"><a href="http://jobs.qld.gov.au/apprentices/apprenticeships.asp">Apprenticeships & Traineeships</a>&nbsp;| </li>');
document.write('<li class="nav1"><a href="http://jobs.qld.gov.au/locations/ourlocations.asp">Our locations</a>&nbsp;| </li>');
document.write('<li class="nav1"><a href="http://jobs.qld.gov.au/ouragencies/ouragencies.asp">Our agencies</a></li>');
document.write('</ul>');
document.write('</div>');


} else { // enageSWE template!


(function( $ ) {


	// use <title> because we haven't seen <h1> yet
	// footer.js will update this
	var pageTitle = $( 'title' ).text(),
	
		smartJobsAssetsPath = $( 'script' ).filter( '[src$="smartjobs/scripts.js"]' ).attr( 'src' ).replace( /smartjobs\/.*$/, 'smartjobs/' );

	
	
	// body main header
	$( 'body' )
		// body @id, @class
		.attr({
			'id' : 'qld-gov-au',
			'class' : 'residents'
		})
		// skip links
		.prepend(
			'<link rel="stylesheet" type="text/css" href="' + smartJobsAssetsPath + 'style.css" media="all" />' +
			//'<link rel="stylesheet" type="text/css" href="http://localhost/assets/smartjobs/style.css" media="all" />' +
			
			'<!-- noindex -->' +
				'<!--[if lt IE 9]><script type="text/javascript">jQuery && jQuery.transformer({addClasses:true});</script><![endif]-->' +

				'<div id="access">' +
					'<h2>Skip links and keyboard navigation</h2>' +
					'<ul>' +
						'<li><a href="#content">Skip to content</a></li>' +
						'<li id="access-instructions"><a href="https://www.qld.gov.au/help/accessibility/keyboard.html#section-aria-keyboard-navigation">Use tab and cursor keys to move around the page (more information)</a></li>' +
					'</ul>' +
				'</div>' +

				'<div id="header-wrapper"><div id="header"><div id="header-bg"></div><div class="box-sizing"><div class="max-width">' +
					'<h2>Site header</h2>' +

					'<div id="qg-coa"><a href="https://www.qld.gov.au/">' +
						'<!--[if gte IE 7]><!--><img src="https://www.qld.gov.au/assets/beta-v2/images/skin/qg-coa.png" width="287" height="50" alt="Queensland Government home" /><!--<![endif]-->' +
						'<!--[if lte IE 6]><img src="https://www.qld.gov.au/assets/beta-v2/images/skin/qg-coa-ie6.png" width="287" height="50" alt="Queensland Government home" /><![endif]-->' +
						'<img src="https://www.qld.gov.au/assets/beta-v2/images/skin/qg-coa-print.png" class="print-version" alt="" />' +
					'</a></div>' +

					'<ul id="tools">' +
						'<li class="nav-contact"><a accesskey="4" href="https://www.qld.gov.au/contact-us/">Contact us</a></li>' +
						'<li class="last-child" id="header-search">' +
							'<form action="https://find.search.qld.gov.au/s/search.html" id="search-form">' +
								'<div>' +
									'<input type="hidden" name="form" value="simple-adv" />' +
									'<label for="search-query">Search website</label>' +
									'<input accesskey="5" type="search" name="query" id="search-query" size="27" value="" />' +
									'<input id="search-button" type="image" src="https://www.qld.gov.au/assets/beta-v2/images/skin/button-search.png" value="Search" />' +
									'<input type="hidden" name="num_ranks" value="10" />' +
									'<input type="hidden" name="tiers" value="off" />' +
									'<input type="hidden" name="collection" value="qld-gov" />' +
									'<input type="hidden" name="profile" value="qld" />' +
								'</div>' +
							'</form>' +
						'</li>' +
					'</ul>' +

					'<div id="nav-site"><ul>' +
						'<li class="nav-residents">' +
							'<a href="https://www.qld.gov.au/queenslanders/">For Queenslanders</a>' +
						'</li>' +
						'<li class="nav-business">' +
							'<a href="http://www.business.qld.gov.au/">Business and industry</a>' +
						'</li>' +
					'</ul></div>' +

				'</div></div></div></div>' +
			'<!-- endnoindex -->'+

			'<div id="page-container"><div class="max-width">'+
				'<div id="breadcrumbs">'+
					'<h2>You are here:</h2>'+
					'<ol>'+
						'<li class="nav-home"><a href="https://www.qld.gov.au/">Queensland Government home</a></li>' +
						'<li class="nav-residents"><a href="https://www.qld.gov.au/queenslanders/">For Queenslanders</a></li>' +
						'<li><a href="/">Smart jobs and careers</a></li>'+
					'</ol>'+
				'</div>'+
			
				'<div id="content-container">'+
					'<div id="content">'+
						'<div class="article"><div class="box-sizing"><div class="border" id="article">'+
							// content goes here
						'</div></div></div>'+
					'</div>'+
					'<div id="asides"><div class="box-sizing"><div class="border">'+
						// asides go here
					'</div></div></div>'+

				'</div>'+
				'<div id="nav-section">'+
					'<div class="box-sizing">'+
						'<h2><a href="/">Smart jobs and careers</a></h2>'+
						'<ul></ul>'+
					'</div>'+
				'</div>'+
			'</div></div>'
		)
	;


	function navNormal( org ) {
		$( '#nav-section ul' ).html(
			'<li><a href="/jobtools/jncustomsearch.jobsearch?in_organid=' + org + '">Job search</a></li>' +
			// '<li><a href="http://jobs.qld.gov.au/search/orglist.asp">By organisation</a></li>' +
			// '<li><a href="http://jobs.qld.gov.au/search/occlist.asp">By occupation</a></li>' +
			'<li><a href="/jobtools/JnCustomLogin.Login?in_organid=' + org + '">My SmartJob</a></li>' +
			'<li><a href="/jobtools/jncustomlogin.JobSeekerToolBoxAction?in_organId=' + org + '&in_create_account_button=Register">Register for My SmartJob</a></li>' +
			// '<li><a href="http://jobs.qld.gov.au/jobswithus/executivejobs.asp">Executive/senior jobs</a></li>' +
			// '<li><a href="http://jobs.qld.gov.au/jobswithus/entryleveljobs.asp">Entry level jobs</a></li>' +
			// '<li><a href="http://jobs.qld.gov.au/jobswithus/continuousapppools.asp">Continuous pools</a></li>' +
			// '<li><a href="http://jobs.qld.gov.au/jobswithus/multiagencypools.asp">Multi-agency pools</a></li>' +
			// '<li><a href="http://jobs.qld.gov.au/jobswithus/applicationprocess.asp">Application process</a></li>' +
			// '<li><a href="http://jobs.qld.gov.au/jobswithus/quicklinks.asp">Other jobs quick links</a></li>'
			'<li><a href="http://www.policerecruit.qld.gov.au/">Police</a></li>'+
			'<li><a href="http://education.qld.gov.au/hr/">Teaching</a></li>'+
			'<li><a href="http://www.ambulance.qld.gov.au/recruitment/">Ambulance</a></li>'+
			'<li><a href="http://www.fire.qld.gov.au/employment/recruitment.asp">Fire</a></li>'+
			'<li><a href="http://www.lgaq.asn.au/web/guest">Qld Local Government</a></li>'+
			'<li><a href="http://www.qld.gov.au/about/how-government-works/other-government-bodies/corporations/">Government-owned corporations</a></li>'+
			'<li><a href="http://www.graduates.qld.gov.au/">Graduate portal</a></li>'+
			'<li><a href="http://www.qld.gov.au/government/departments/">Our agencies</a></li>'
		);
	}

	function navSession( in_sess, in_org ) {

		sess = in_sess * 1;
		org = in_org * 1;

		if ( org == '14904' ) {
			insite = 'Smart%20Jobs';
		} else if ( org == '15033' ) {
			insite = 'GovNet';
		} else if ( org == '15212' ) {
			insite = 'Training%20Full';
		} else if ( org == '15255' ) {
			insite = 'Training%20Lite';
		} else if ( org == '14674' ) {
			insite = 'Smart%20Jobs';
		} else { //ie: after submitting a questionnaire, the org ID changes, so we need to check the url
			currURL = window.location.href;
			if ( currURL.indexOf('govnet' ) != -1 ) { 
				insite = 'GovNet';
				org = '15033';
			} else {
		  		insite = 'Smart%20Jobs'; 
				org = '14904'
			}
		}

		$( '#nav-section ul' ).html(
			'<li><a href="/jobtools/jncustomsearch.jobsearch?in_organid=' + org + '&in_sessionid=' + sess + '">Job search</a></li>'+
			// '<li><a href="http://jobs.qld.gov.au/search/orglist.asp">By organisation</a></li>'+
			// '<li><a href="http://jobs.qld.gov.au/search/occlist.asp">By occupation</a></li>'+
			'<li><a href="/jobtools/JnCustomLogin.usermenu?in_organid=' + org + '&in_sessionid=' + sess + '">My SmartJob</a></li>'+
			'<li><a href="/jobtools/JnCustomDailyEmail.UserEmailProfile?in_organid=' + org + '&in_sessionid=' + sess + '">My job alert</a></li>'+
			'<li><a href="/jobtools/JnCustomLogin.UpdateSettings?in_organId=' + org + '&in_sessionid=' + sess + '">Update details</a></li>'+
			'<li><a href="/jobtools/apCustomAppMgr.DisplayApplicationSummary?in_organId=' + org + '&in_site=' + insite + '&in_sessionid=' + sess + '&in_template_orgid=' + org + '">My applications</a></li>'+
			// '<!-- <li><a href="/jobtools/cmcustomaa.Intro?in_organId=' + org + '&in_sessionid=' + sess + '">My Profile</a></li> -->'+
			'<li><a href="/jobtools/jncustomlogin.LogOut?in_sessionid=' + sess + '&in_organId=' + org + '">Logout</a></li>'+
			// '<li><a href="http://jobs.qld.gov.au/jobswithus/executivejobs.asp">Executive/senior jobs</a></li>'+
			// '<li><a href="http://jobs.qld.gov.au/jobswithus/entryleveljobs.asp">Entry level jobs</a></li>'+
			// '<li><a href="http://jobs.qld.gov.au/jobswithus/continuousapppools.asp">Continuous pools</a></li>'+
			// '<li><a href="http://jobs.qld.gov.au/jobswithus/multiagencypools.asp">Multi-agency pools</a></li>'+
			// '<li><a href="http://jobs.qld.gov.au/jobswithus/applicationprocess.asp">Application process</a></li>'+
			// '<li><a href="http://jobs.qld.gov.au/jobswithus/quicklinks.asp">Other jobs quick links</a></li>'
			'<li><a href="http://www.policerecruit.qld.gov.au/">Police</a></li>'+
			'<li><a href="http://education.qld.gov.au/hr/">Teaching</a></li>'+
			'<li><a href="http://www.ambulance.qld.gov.au/recruitment/">Ambulance</a></li>'+
			'<li><a href="http://www.fire.qld.gov.au/employment/recruitment.asp">Fire</a></li>'+
			'<li><a href="http://www.lgaq.asn.au/web/guest">Qld Local Government</a></li>'+
			'<li><a href="http://www.qld.gov.au/about/how-government-works/other-government-bodies/corporations/">Government-owned corporations</a></li>'+
			'<li><a href="http://www.graduates.qld.gov.au/">Graduate portal</a></li>'+
			'<li><a href="http://www.qld.gov.au/government/departments/">Our agencies</a></li>'
		);
	}


	// exports
	window.navNormal = navNormal;
	window.navSession = navSession;
	window.pageTitle = pageTitle;

}( jQuery ));


}
