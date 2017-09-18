var engageSWE = true;
// engageSWe = ! /MSIE 6/i.test(navigator.userAgent) ; // IE6 seems ok now, leave it in (2011-11-19)


if ( ! engageSWE ) {

	// Old SmartJobs template (+ GA)


// google analytics
	var _gaq = _gaq || [];
	_gaq.push(
		['qgo._setAccount', 'UA-7276966-1'],
		['qgo._trackPageview']
	);

	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www')
	+ '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
// end google analytics


function openNewWin(theURL,winName,features) { 
  openwindow=window.open(theURL,winName,features);
  openwindow.focus();
  //return false
}

function navNormal(org){

document.write('<!-- NAVIGATION DIV -->');
document.write('<div id="navdiv2">');
document.write('<h2><a name="nav2">Jobs with us</a></h2>');
document.write('<ul class="nav2">');
document.write('<li class="nav2"><a href="/jobtools/jncustomsearch.jobsearch?in_organid=' + org + '">Search</a></li>');
document.write('<li class="nav3"><a href="http://jobs.qld.gov.au/search/orglist.asp">By organisation</a></li>');
document.write('<li class="nav3"><a href="http://jobs.qld.gov.au/search/occlist.asp">By occupation</a></li>');
document.write('<li class="nav2"><a href="/jobtools/JnCustomLogin.Login?in_organid=' + org + '">My SmartJob</a></li>');
document.write('<li class="nav3"><a href="/jobtools/jncustomlogin.JobSeekerToolBoxAction?in_organId=' + org + '&in_create_account_button=Register">Register</a></li>');
document.write('<li class="nav2"><a href="http://jobs.qld.gov.au/jobswithus/executivejobs.asp">Executive/senior jobs</a></li>');
document.write('<li class="nav2"><a href="http://jobs.qld.gov.au/jobswithus/entryleveljobs.asp">Entry level jobs</a></li>');
document.write('<li class="nav2"><a href="http://jobs.qld.gov.au/jobswithus/continuousapppools.asp">Continuous pools</a></li>');
document.write('<li class="nav2"><a href="http://jobs.qld.gov.au/jobswithus/multiagencypools.asp">Multi-agency pools</a></li>');
document.write('<li class="nav2"><a href="http://jobs.qld.gov.au/jobswithus/applicationprocess.asp">Application process</a></li>');
document.write('<li class="nav2"><a href="http://jobs.qld.gov.au/jobswithus/quicklinks.asp">Other jobs quick links</a></li>');
document.write('</ul>');
document.write('<p>&nbsp;<br>&nbsp;</p>');
document.write('<img src="/site/images/pageoption1.gif" border="0" width="145" height="140" alt="">');
document.write('</div>');
document.write('<!-- END NAVIGATION DIV -->');
}

function navSession(in_sess,in_org){

sess = in_sess*1;
org = in_org*1;



if (org == '14904') { insite = 'Smart%20Jobs'; }
else if (org == '15033') { insite = 'GovNet'; }	
else if (org == '15212') { insite = 'Training%20Full'; }
else if (org == '15255') { insite = 'Training%20Lite'; }
else if (org == '14674') { insite = 'Smart%20Jobs'; }
else { //ie: after submitting a questionnaire, the org ID changes, so we need to check the url
  currURL = window.location.href;
  if (currURL.indexOf('govnet')!= -1){ 
  		insite = 'GovNet';
		org = '15033';
		}
  else {
  		insite = 'Smart%20Jobs'; 
		org = '14904'
  }
}

document.write('<!-- NAVIGATION DIV -->');
document.write('<div id="navdiv2">');
document.write('<h2><a name="nav2">Jobs with us</a></h2>');
document.write('<ul class="nav2">');
document.write('<li class="nav2"><a href="/jobtools/jncustomsearch.jobsearch?in_organid=' + org + '&in_sessionid=' + sess + '">Search</a></li>');
document.write('<li class="nav3"><a href="http://jobs.qld.gov.au/search/orglist.asp">By organisation</a></li>');
document.write('<li class="nav3"><a href="http://jobs.qld.gov.au/search/occlist.asp">By occupation</a></li>');
document.write('<li class="nav2"><a href="/jobtools/JnCustomLogin.usermenu?in_organid=' + org + '&in_sessionid=' + sess + '">My SmartJob</a></li>');
document.write('<li class="nav3"><a href="/jobtools/JnCustomDailyEmail.UserEmailProfile?in_organid=' + org + '&in_sessionid=' + sess + '">Job alert</a></li>');
document.write('<li class="nav3"><a href="/jobtools/JnCustomLogin.UpdateSettings?in_organId=' + org + '&in_sessionid=' + sess + '">Update details</a></li>');
document.write('<li class="nav3"><a href="/jobtools/apCustomAppMgr.DisplayApplicationSummary?in_organId=' + org + '&in_site=' + insite + '&in_sessionid=' + sess + '&in_template_orgid=' + org + '">My applications</a></li>');
document.write('<!-- <li class="nav3"><a href="/jobtools/cmcustomaa.Intro?in_organId=' + org + '&in_sessionid=' + sess + '">My Profile</a></li> -->');
document.write('<li class="nav3"><a href="/jobtools/jncustomlogin.LogOut?in_sessionid=' + sess + '&in_organId=' + org + '">Logout</a></li>');
document.write('<li class="nav2"><a href="http://jobs.qld.gov.au/jobswithus/executivejobs.asp">Executive/senior jobs</a></li>');
document.write('<li class="nav2"><a href="http://jobs.qld.gov.au/jobswithus/entryleveljobs.asp">Entry level jobs</a></li>');
document.write('<li class="nav2"><a href="http://jobs.qld.gov.au/jobswithus/continuousapppools.asp">Continuous pools</a></li>');
document.write('<li class="nav2"><a href="http://jobs.qld.gov.au/jobswithus/multiagencypools.asp">Multi-agency pools</a></li>');
document.write('<li class="nav2"><a href="http://jobs.qld.gov.au/jobswithus/applicationprocess.asp">Application process</a></li>');
document.write('<li class="nav2"><a href="http://jobs.qld.gov.au/jobswithus/quicklinks.asp">Other jobs quick links</a></li>');
document.write('</ul>');
document.write('<br>');
document.write('<img src="/site/images/pageoption1.gif" border="0" width="145" height="140" alt="">');
document.write('	</div>');
document.write('<!-- END NAVIGATION DIV -->');
}


} else { // enageSWE template!


(function() {


	document.write(
		'<link rel="stylesheet" type="text/css" href="https://www.qld.gov.au/assets/beta-v2/style/qgov.css" media="all" />' +
		'<!--[if lt IE 9]><link rel="stylesheet" href="https://www.qld.gov.au/assets/beta-v2/style/qgov-ie.css" type="text/css" media="all" /><![endif]-->' +

		'<!-- layout-small is assumed by default (combined with qgov.css) -->' +
		'<link href="https://www.qld.gov.au/assets/beta-v2/style/layout-medium.css" media="only all and (min-width: 640px) and (max-width: 980px)" rel="stylesheet" type="text/css" />' +
		'<link href="https://www.qld.gov.au/assets/beta-v2/style/layout-large.css" media="only all and (min-width: 980px)" rel="stylesheet" type="text/css" />' +

		'<meta name="viewport" content="width=device-width" />' +

		'<link rel="shortcut icon" href="https://www.qld.gov.au/assets/beta-v2/images/skin/favicon.ico" />' +

		'<!-- Grab Google CDN\'s jQuery. Fall back to local copy if necessary -->' +
		'<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>' +
		'<script type="text/javascript"><!-- //' +
			'!window.jQuery && document.write(unescape(\'%3Cscript src="https://www.qld.gov.au/assets/beta-v2/script/jquery-1.7.2-min.js"%3E%3C/script%3E\'));' +
		'// --></script>' +
		'<script type="text/javascript" src="https://www.qld.gov.au/assets/beta-v2/script/qgov-environment.js" id="qgov-environment"></script>' +
		'<!--[if lt IE 9]>' +
		'<script type="text/javascript">document.createElement(\'abbr\');document.createElement(\'time\');</script>' +
		'<script type="text/javascript" src="https://www.qld.gov.au/assets/beta-v2/script/ie-layout.js"></script>' +
		'<![endif]-->'
	);


	function openNewWin( theURL, winName, features ) { 
		openwindow = window.open( theURL, winName, features );
		openwindow.focus();
		//return false
	}


	// exports
	window.openNewWin = openNewWin;
	// window.dateModified = new Date();


	// captureEvents is obselete (errors seen in IE8 standards mode)
	// https://developer.mozilla.org/en/DOM/window.captureEvents
	if ( typeof window.captureEvents === 'undefined' ) {
		window.captureEvents = function() {};
	}


}());


}
