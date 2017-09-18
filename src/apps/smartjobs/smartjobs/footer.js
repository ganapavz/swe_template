
if ( ! engageSWE ) {

	// Old SmartJobs template
		document.write('<div id="footer-smartjob">');
		document.write('<a href="http://www.smartstate.qld.gov.au/" target="_blank"><img src="/site/images/smartjob.gif" alt="Smart job, smart state, smart move." border="0"></a>');
		document.write('</div>');
		document.write('<div id="footerdiv">');
		document.write('    <p><a href="http://jobs.qld.gov.au/copyright/copyright.asp" title="Copyright" name="footer">Copyright</a> | <a href="http://jobs.qld.gov.au/disclaimer/disclaimer.asp" title="Disclaimer">Disclaimer</a> | <a href="http://jobs.qld.gov.au/privacy/privacy.asp" title="Privacy">Privacy</a> | <a href="http://jobs.qld.gov.au/help/accesskeys.asp" title="Access Keys" accesskey="0">Access keys</a> | <a href="http://www.qld.gov.au/other_languages/index.html" title="Other languages" target="_blank"><img src="/site/images/icon_flags.gif" alt="Other languages" width="29" height="24" border="0">Other languages</a></p>');
		document.write('    <p>&copy; The State of Queensland 2006.</p>');
		document.write('    <p><a href="http://www.qld.gov.au" title="Link to Queensland Government (www.qld.gov.au)" target="_blank">Queensland Government</a></p>');
		document.write('</div>');
		document.write('	</div> <!-- END Container DIV -->');
		document.write('	</div>');
		document.write('</body>');
		document.write('</html>');


} else { // enageSWE template!


// finish him!
document.write( '</form></body></html>' );


(function( $ ) {

	// you put the content in the article and you throw the div away
	$( '#contentdiv > *' ).each(function() {
		document.getElementById( 'article' ).appendChild( this );
	});


	// move asides
	$( '#rightcolumn > *' ).filter(function() {
		return $( this ).text().length > 0;
	}).each(function() {
		var newAside = $( '<div class="aside" />' ).appendTo( '#asides > div > div' );
		// document.getElementById( 'asides' ).append( newAside );
		newAside[ 0 ].appendChild( this );
	});
	$( '#rightcolumn' ).remove();

	// quick search asides
	$( 'img[src$="quicksearch.gif"]' ).replaceWith( '<h2>Search</h2>' );
	// executive jobs
	$( '#asides .aside' ).eq( 0 ).append(
		$( 'img[src$="executivejobs.gif"]' ).parent().text( 'Executive/senior jobs' )
	).addClass( 'search' ).find( ':submit' ).wrap( '<div style="margin-top: .5em"/>' );

	// login aside
	$( '#asides img[src$="logon.gif"]' ).closest( '.aside' )
		.addClass( 'login' )
		.prepend( '<h2>Log in</h2>' )
		.find( 'img' )
			.remove()
			.end()
		.find( 'a' )
			.css( 'display', 'block' );

	$( '#asides > .box-sizing' )
	// new help aside
	.append(
		'<div class="aside contact"><h2>Need help? Contact us</h2>'+
		'<p>If you have any questions about your account or accessing this website, please <a href="http://www.qld.gov.au/jobs/government/qgov-jobs-feedback/">contact our Helpdesk</a>.</p>'+
		'</div>'
	);

	// grad portal aside
	$( 'img[src$="graduate_portal.gif"]' )
		.closest( '.aside' )
			.appendTo( '#asides > .box-sizing' );
	$( 'img[src$="graduate_portal.gif"]' )
		.closest( 'div' )
			.prepend( '<h2>Graduate portal</h2><p>This recruitment portal is your gateway to a wide range of graduate program positions on offer in the Queensland Government.</p>' )
			.end()
		.replaceWith( '<p>Visit the Queensland Graduate Portal</p>' );

	// add upcoming changes alert to home page
	if ( /jobsearch/.test( location.pathname )) {
		$( '.border', '#asides' ).eq( 0 ).prepend(
			
'<div class="aside feedback">'+
    '<h2>Changes to SmartJobs</h2>'+
    '<p>To make SmartJobs easier to use, we will be changing the search controls, search results and application form on 5 February.</p>'+
    '<p>If you have any feedback about these changes, please <a href="#page-feedback">let us know</a>—this will help us to find ways of making this site even better.</p>'+
'</div>'

		);
	}


	// use H1 as title
	window.pageTitle = $( 'h1' ).eq( 0 ).text();

	// fix title
	document.title = pageTitle + ' | Smart jobs and careers | Queensland Government';
	$( '#breadcrumbs ol' ).append( $( '<li class="last-child">' ).text( pageTitle ));


	// spacer gifs!
	$( 'img[src$="spacer.gif"]' ).remove();


	// all your styles are belong to css
	$.each([
		'width',
		'cellspacing', 
		'cellpadding', 
		'align', 
		'bgcolor', 
		'leftmargin', 
		'marginwidth', 
		'marginheight', 
		'topmargin',
		'face',
		'color'
	], function( index, value ) {
		$( "[" + value + "]" ).removeAttr( value );
	});
	// all your css are belong to us
	$( 'style' ).not( '#validation-front' ).remove();
	$( 'link[rel=stylesheet]' ).not( '[href^=http]' ).remove();


	// append page meta section
	$( '#content-container' ).append(
		'<div id="meta-wrapper"><div class="meta-box-sizing"><div class="border">'+

			// '<div id="document-properties"><div class="box-sizing">'+
			// 	'<dl>'+
			// 		'<dt>Last updated</dt>'+
			// 		'<dd>' + dateModified.toString() + '</dd>'+
			// 	'</dl>'+
			// '</div></div>'+
			
			'<!-- noindex -->' +
			'<div id="post-page-options" class="page-options">' +
				'<ul>' +
					'<li class="share">' +
						'<h2>Share:</h2>' +
						'<a href="https://www.qld.gov.au/share/?via=facebook&amp;title=' + pageTitle + '" title="Share using Facebook"><img src="//www.qld.gov.au/assets/v2/images/skin/button-share-facebook.png" alt="Share using Facebook" /></a>' +
						'<a href="https://www.qld.gov.au/share/?via=twitter&amp;title=' + pageTitle + '" title="Share using Twitter"><img src="//www.qld.gov.au/assets/v2/images/skin/button-share-twitter.png" alt="Share using Twitter" /></a>' +
						'<a href="https://www.qld.gov.au/share/?via=linkedin&amp;title=' + pageTitle + '" title="Share using LinkedIn"><img src="//www.qld.gov.au/assets/v2/images/skin/button-share-linkedin.png" alt="Share using LinkedIn" /></a>' +
						'<a href="https://www.qld.gov.au/share/?title=' + pageTitle + '" title="Share using another service&hellip;"><img src="//www.qld.gov.au/assets/v2/images/skin/button-share-more.png" alt="Share using another service…" /></a>' +
					'</li>' +
				'</ul>' +
			'</div>' +

			'<div id="page-feedback">' +
				'<form method="post" action="https://www.qld.gov.au/assets/apps/feedback/feedback.jsp" class="form">' +

					'<h2>Page feedback</h2>' +

					'<div id="page-feedback-privacy" class="preamble">' +
						'<h3>Your privacy</h3>' +
						'<p>Information collected through this form is used to improve this website.</p>' +
						'<p>Any information you submit that could identify you (e.g. name, email address) will be stored securely, and destroyed after we process your feedback.</p>' +
					'</div>' +

					'<ol class="questions">' +
						'<li id="page-was-useful">' +
							'<fieldset>' +
								'<legend>' +
									'<span class="label">This page was</span>' +
								'</legend>' +
								'<ul class="choices compact">' +
									'<li>' +
										'<input type="radio" name="useful" id="useful-yes" value="yes" /> ' +
										'<label for="useful-yes">Useful</label>' +
									'</li>' +
									'<li>' +
										'<input type="radio" name="useful" id="useful-no" value="no" /> ' +
										'<label for="useful-no">Not useful</label>' +
									'</li>' +
								'</ul>' +
							'</fieldset>' +
						'</li>' +
						'<li class="instruction">' +
							'<p>We want this information to be the best it can be and we know we can&rsquo;t do it without you.' +
							'Let us know what you thought of this page and what other information you would like to see.</p>' +
							'<p>We do not reply to feedback. <a href="https://www.qld.gov.au/contact-us/">Contact us if you need a response</a>.</p>' +
						'</li>' +

						'<li>' +
							'<label for="comments">' +
								'<span class="label">Other comments</span>' +
							'</label>' +
							'<textarea name="comments" id="comments" cols="50" rows="7"></textarea>' +
						'</li>' +

						'<li class="section">' +
							'<fieldset id="feedback-contact">' +
								'<legend>' +
									'<span class="h3">Contact (optional)</span>' +
								'</legend>' +
								'<ol class="questions">' +
									'<li>' +
										'<label for="contact">' +
											'<span class="label">Please provide your <strong>phone number</strong> or <strong>email address</strong> if you are happy for us to contact you with any follow-up questions</span>' +
										'</label>' +
										'<input type="text" value="" name="contact" id="contact" size="48" />' +
									'</li>' +
								'</ol>' +
							'</fieldset>' +
						'</li>' +

						'<li id="captcha-container">' +
							'<label for="captcha">Please leave this blank (this helps us identify automatic spam)</label>' +
							'<input type="text" name="captcha" id="captcha" value="" />' +
						'</li>' +

						'<li class="footer">' +
							'<input type="hidden" name="franchise" id="franchise" value="smartjobs" />' +
							'<input type="hidden" name="page-title" id="page-title" value="' + pageTitle + '" />' +
							'<ul class="actions">' +
								'<li><strong><input type="submit" value="Submit feedback" /></strong></li>' +
							'</ul>' +
						'</li>' +
					'</ol>' +
				'</form>' +
			'</div>' +
			'<!-- endnoindex -->' +

		'</div></div></div>'
	);


	// write footer
	document.write(
		'<div id="footer">' +
			'<!-- noindex -->' +
			'<div id="fat-footer">' +
				'<div class="max-width"><div class="box-sizing">' +
					'<h2>Explore this site</h2>' +
					'<div class="section">' +
						'<h3><a href="https://www.qld.gov.au/">Queensland Government</a></h3>' +
						'<ul>' +
							'<li><a href="https://www.qld.gov.au/about/contact-government/contacts/">Government contacts</a></li>' +
							'<li><a href="https://www.qld.gov.au/about/contact-government/have-your-say/">Have your say</a></li>' +
							'<li><a href="https://www.qld.gov.au/about/staying-informed/">Staying informed</a></li>' +
							'<li><a href="https://www.qld.gov.au/about/government-jobs/">Government jobs</a></li>' +
							'<li><a href="https://www.qld.gov.au/about/how-government-works/">How government works</a></li>' +
						'</ul>' +
					'</div>' +
					'<div class="section" id="for-qldrs">' +
						'<h3><a href="https://www.qld.gov.au/queenslanders/">For Queenslanders</a></h3>' +
						'<ul>' +
							'<li><a href="https://www.qld.gov.au/transport/">Transport and motoring</a></li>' +
							'<li><a href="https://www.qld.gov.au/jobs/">Employment and jobs</a></li>' +
							'<li><a href="https://www.qld.gov.au/housing/">Homes and housing</a></li>' +
							'<li><a href="https://www.qld.gov.au/education/">Education and training</a></li>' +
							'<li><a href="https://www.qld.gov.au/community/">Community support</a></li>' +
							'<li><a href="https://www.qld.gov.au/health/">Health and wellbeing</a></li>' +
							'<li><a href="https://www.qld.gov.au/emergency/">Emergency services and safety</a></li>' +
							'<li><a href="https://www.qld.gov.au/about/">About Queensland and its government</a></li>' +
						'</ul>' +
						'<ul>' +
							'<li><a href="https://www.qld.gov.au/families/">Parents and families</a></li>' +
							'<li><a href="https://www.qld.gov.au/disability/">People with disability</a></li>' +
							'<li><a href="https://www.qld.gov.au/seniors/">Seniors</a></li>' +
							'<li><a href="https://www.qld.gov.au/atsi/">Aboriginal and Torres Strait Islander peoples</a></li>' +
							'<li><a href="https://www.qld.gov.au/youth/">Youth</a></li>' +
							'<li><a href="https://www.qld.gov.au/environment/">Environment, land and water</a></li>' +
							'<li><a href="https://www.qld.gov.au/law/">Your rights, crime and the law</a></li>' +
							'<li><a href="https://www.qld.gov.au/recreation/">Recreation, sports and arts</a></li>' +
						'</ul>' +
					'</div>' +
					'<div class="section">' +
						'<h3><a href="http://www.business.qld.gov.au/">Business and industry</a></h3>' +
						'<ul>' +
							'<li><a href="http://www.business.qld.gov.au/getting-into-business.html">Getting into business</a></li>' +
							'<li><a href="http://www.business.qld.gov.au/running-a-business.html">Running a business</a></li>' +
							'<li><a href="http://www.business.qld.gov.au/employing-people.html">Employing people</a></li>' +
							'<li><a href="http://www.business.qld.gov.au/trade-and-investment.html">Trade and investment</a></li>' +
							'<li><a href="http://www.business.qld.gov.au/industry-sectors.html">Industry sectors</a></li>' +
							'<li><a href="http://www.business.qld.gov.au/regional-queensland.html">Regional Queensland</a></li>' +
						'</ul>' +
					'</div>' +
					'<div class="section">' +
						'<!-- For non-residents -->' +
					'</div>' +
				'</div></div>' +
			'</div>' +
			'<div class="max-width"><div class="box-sizing">' +
				'<h2>Site footer</h2>' +
				'<ul>' +
					'<li id="link-help"><a href="https://www.qld.gov.au/help/">Help</a></li>' +
					'<li class="legal"><a href="https://www.qld.gov.au/legal/copyright/">Copyright</a></li>' +
					'<li class="legal"><a href="https://www.qld.gov.au/legal/disclaimer/">Disclaimer</a></li>' +
					'<li class="legal"><a href="https://www.qld.gov.au/legal/privacy/">Privacy</a></li>' +
					'<li class="legal"><a href="https://www.qld.gov.au/right-to-information/">Right to information</a></li>' +
					'<li id="link-accessibility"><a href="https://www.qld.gov.au/help/accessibility/">Accessibility</a></li>' +
					'<li id="link-jobs"><a href="https://smartjobs.qld.gov.au/">Jobs in Queensland Government</a></li>' +
					'<li><a href="https://www.qld.gov.au/languages/">Other languages</a></li>' +
				'</ul>' +
				'<!-- endnoindex -->' +
				'<p class="legal">&copy; The State of Queensland 1995&ndash;2012</p>' +
				'<p><a href="https://www.qld.gov.au/" accesskey="1">Queensland Government</a></p>' +
				'<div id="qg-branding"><p><img class="tagline" src="https://www.qld.gov.au/assets/v2/images/skin/tagline.png" alt="Great state. Great opportunity." /></p></div>' +
			'</div></div>' +
		'</div>'+
		'<div id="scripts">'+
			'<script type="text/javascript" src="https://www.qld.gov.au/assets/v2/script/loader.js"></script>' +
			'<script type="text/javascript" src="https://www.qld.gov.au/assets/v2/script/init.js" defer="defer"></script>'+
		'</div>'
	);

$(function(){ // AR 2011-11-19: Apparently IE body hasn't finished parsing, so wait for DOMReady before appending to it (http://blogs.msdn.com/b/ie/archive/2008/04/23/what-happened-to-operation-aborted.aspx)
	document.body.appendChild( document.getElementById( 'footer' ));
	document.body.appendChild( document.getElementById( 'scripts' ));
});


	// // analytics
	document.write(
		'<div id="analytics">'+
			'<script id="analytics-inline-config" type="text/javascript"><!--' +
				'qg.swe.pageTitle = "' + $( 'title' ).text() + '";' +
				'qg.swe.franchiseTitle = "smartjobs";' +

				'qg.swe.vhost = \'smartjobs-prod\';' +
				'qg.swe.servedBy = \'smartjobs.qld.gov.au\';' +

			'//--></script><!-- end #analytics-inline-config -->' +

		'<!-- Load configuration for analytics -->' +
			'<script type="text/javascript" src="https://www.qld.gov.au/assets/v2/script/analytics.js" defer="defer"></script>' +
			'<!-- Load configuration for SiteCatalyst analytics -->' +
			'<!-- SiteCatalyst code version: H.24.3.' +
			'Copyright 1996-2012 Adobe, Inc. All Rights Reserved' +
			'More info available at http://www.omniture.com -->' +
			'<script language="JavaScript" type="text/javascript" src="https://www.qld.gov.au/assets/v2/script/analytics-site-catalyst.js"></script>' +
			'<script type="text/javascript"><!--' +
			'/* You may give each page an identifying name, server, and channel on' +
			'the next lines. */' +
			's.pageName=qg.swe.pageTitle;' +
			's.server=qg.swe.servedBy;' +
			's.channel=""' +
			's.pageType=qg.swe.pageType;' +
			's.prop1=""' +
			's.prop2=""' +
			's.prop3=""' +
			's.prop4=""' +
			's.prop5=""' +
			'/* Conversion Variables */' +
			's.campaign=""' +
			's.state=""' +
			's.zip=""' +
			's.events=""' +
			's.products=""' +
			's.purchaseID=""' +
			's.eVar1=""' +
			's.eVar2=""' +
			's.eVar3=""' +
			's.eVar4=""' +
			's.eVar5=""' +
			'/************* DO NOT ALTER ANYTHING BELOW THIS LINE ! **************/' +
			'var s_code=s.t();if(s_code)document.write(s_code)//--></script>' +
			'<script type="text/javascript"><!--' +
			'if(navigator.appVersion.indexOf("MSIE")>=0)document.write(unescape("%3C")+"\!-"+"-")' +
			'//--></script>' +
			// no point including NOSCRIPT in html injected by js
			// '<noscript><img src="https://smartservicequeensland.122.2o7.net/b/ss/ssqqld-development/1/H.24.3--NS/0"' +
			// 'height="1" width="1" border="0" alt="" /></noscript><!--/DO NOT REMOVE/-->' +
			'<!-- End SiteCatalyst code version: H.24.3. -->' +
		'</div>'
	);


	// headings
	$( '.rivtableheader:contains(Search)' ).remove();
	$( '.rivtableheader' ).wrapInner( '<h2/>' );
	// replace 'Job details' with job title
	$( "h2:contains(Job details)" ).each(function() {
		var $this = $( this ),
			title = $this.next( "table" ).find( "table.structuretable tr" ).eq(1).text()
		;
		$this.text( title );
	});
	// job details pretend heading
	$( "b:contains(Job details)" ).remove();
	$( "b:contains(Key duties)" ).replaceWith( "<h3>Key duties</h3>" );
	$( "b:contains(Further info)" ).replaceWith( "<h3>Further information</h3>" );

	// remove 'job summary' h2
	$( "h2:contains(Job Summary)" ).remove();


	// blank messages?
	$( 'p.message' ).filter(function() {
		return $( this ).text().length === 0;
	}).remove();

	// status
	$( 'h1 + p.message' ).wrap( '<div class="status info"></div>' );
	// <tag_errormessage> eh? must be new in html5
	$( 'tag_errormessage' ).closest( 'p.message' ).wrap( '<div class="status warn"></div>' );

	// registration error messages
	$( 'form[action$="jncustomlogin.CreateNewUser"] p.message' ).wrap( '<div class="status warn"></div>' );

	// required fields
	var requiredMarkers = $( 'span.message' ).filter(function() {
		return $( this ).text().indexOf( '*' ) > -1;
	}).css({ color: 'red' });
	$( 'span.message' ).not( requiredMarkers ).wrapInner( '<small/>' );

	// smalltext
	$( '.smalltext' ).wrapInner( '<small/>' ).children().unwrap();

	// forms
	$( '#article form div[style]' ).addClass( 'form' ).removeAttr( 'style' ).css({ padding: '.5em' });


	// search results
	var formatSearchResultsMonth = function( s ) {
		s = s.replace( /^0/, '' );
		s = s.replace( /Sep-/, 'Sept ' );

		return s.replace( /-/g, ' ' );
	}

	if ( /search/.test( location.pathname )) {
		// search results style
		//$( 'table.tabledata' ).before( '<ol class="search-results"></ol>' );
		$( 'table.tabledata' ).before( '<table id="search-results" aria-role="presentation"></table>' );
		// throw away header row
		$( 'table.tabledata tr' ).eq(0).remove();
		// map table rows to search result list items
		$( 'table.tabledata tr' ).each(function() {
			var $this = $( this );

			var href = $this.find( 'a' ).attr( 'href' );

			$( 'table#search-results' )
				.append(
					'<tbody class="result">' +
						'<tr class="result-start"><td rowspan="3" class="select"></td>' +
							'<td class="job-title" colspan="2"><h3><a href="' + href + '">' + '<span class="result-title" style="float: none">' + $this.find( 'a' ).text() + '</span></a></h3>' + '</td>' +
							'<td class="classification"><span class="classification">'+ $this.find( 'td' ).eq(3).text() +'</span></td></tr>' +
						'<tr><td class="agency" colspan="2">'+ $this.find( 'td' ).eq(4).text() +'</td><td class="position-type">'+ $this.find( 'td' ).eq(5).text() +'</td></tr>' +
						'<tr class="result-end meta"><td class="location">'+ $this.find( 'td' ).eq(6).text() +'</td><td class="category">'+ $this.find( 'td' ).eq(2).text() +'</td>'+
						'<td class="closing-date">Closes '+ formatSearchResultsMonth( $this.find( 'td' ).eq(7).text() ) +'</td></tr>' +
					'</tbody>'
				)
				.find( 'td.select' ).eq( -1 ).append( $this.find( ':checkbox' ))
			;

		});
		$( 'table.tabledata' ).remove();

		// search results header
		//$( "ol.search-results").unwrap();
		$( "#search-results").unwrap();
		$( "<h2 class='resultset-title'>Displaying search results <strong>" +
			$( "#search-results" ).prev( "p" ).find( "b" ).eq(0).text().replace( /\s*-\s*/, "&ndash;" ) +
			"</strong> of <strong>" +
			$( "#search-results").prev( "p" ).find( "b" ).eq(1).text() +
			"</strong> matching jobs</h2>"
		).replaceAll( $( "#search-results").prev( "p" ) );
	}

// Remove most layout tables (expect that ones that would cause major performance issues)
	$.fn.exterminateLayoutTable = function() {
		// wrap table, so further processing can be restricted to that context
			var $cont = $(this).wrap('<div class="exlayouttable">').parent();
		// unwrap elements
			$(this).children().unwrap(); // remove table
			$( 'thead, tfoot, tbody', $cont ).not( 'table thead, table tfoot, table tbody' ).children().unwrap();
			$( 'thead, tfoot, tbody', $cont ).not( 'table thead, table tfoot, table tbody' ).remove();
			$( 'tr', $cont ).not( 'table tr' ).children().unwrap();
			$( 'tr', $cont ).not( 'table tr' ).remove();
		// replace th/td with div
			$( 'th, td', $cont ).not( 'table th, table td' ).wrapInner( '<div />' ).children().unwrap();
			$( 'th, td', $cont ).not( 'table th, table td' ).remove();
	};
	
	if (/JnCustomDailyEmail\.userEmailProfile/.test( location.pathname )) {
		
		// Remove tables only from the  form table on page: JnCustomDailyEmail.userEmailProfile
			$('form[name="emailform"] > .form > table').exterminateLayoutTable();
		
		// Remove all other tables (but not for IE, IE will be slooow)
			if (! $.browser.msie) {
				$( 'table' ).not( 'table.structuretable table.rivtable, table table.vrivtable, table.tabledata, table#search-results' ).exterminateLayoutTable();
			}
		
		
	} else if (/jncustomsearch\.searchAction/.test( location.pathname )) {
		
		// Remove tables only from the searchform and asides on page: jncustomsearch.searchAction
			$('form[name="searchform"] table').exterminateLayoutTable();
			$('#asides table').exterminateLayoutTable();
		
		// Remove all other tables (but not for IE, IE will be slooow)
			if (! $.browser.msie) {
				$( 'table' ).not( 'table.structuretable table.rivtable, table table.vrivtable, table.tabledata, table#search-results' ).exterminateLayoutTable();
			}
			
			
	} else if (/apCustomAppMgr/i.test( location.pathname ) && $( '#content' ).find( 'table.tabledata' ).length > 0 ) {

		// rework table to fit in content column
		var table = $( '#content' ).find( 'table.tabledata' ).eq( 0 ).addClass( 'table' );

		if ( /no application history/.test( table.text() )) {

			table.html(
				'<tr><td><div class="status info"><p>You have no application history with the Queensland Government.</p></div></td></tr>'
			);
			
		} else {

			table.find( 'tr' ).each(function( index ) {
				var tr = $( this );
				if ( index === 0 ) {
					tr.html( '<th>Status</th><th>Withdraw</th><th>Job details</th>' );

				} else {

					var row = tr.html();

					// regex html manipulation for IE6 performance
					row = row.replace( /<\/td>\s*<td[^>]*>/i, '<br />' );
					row = row.replace( /<\/a>\s*<\/td>\s*<td[^>]*>/gi, '</a><br />' );

					tr.html( row );

				}
			});
		}

	} else if ( $( 'form' ).filter( '[action*=qbQuestionnaireForm]' ).length > 0 ) {
	// questionnaire
		$( 'td, span' ).removeAttr( 'style' );

		// remove tables in main form
		var form = $( 'form', '#article' ),
			html = form.html()
			;

		// remove table, rows, head, body and foot
		// also remove font and span
		html = html.replace( /<\/?(?:table|thead|tbody|tfoot|tr|font|span)[^>]*>/gi, '' );
		// remove empty cells
		html = html.replace( /<td[^>]*>\s*(?:&nbsp;)?\s*<\/td>/gi, '' );
		// remove the  </td><td ...> separating radio buttons and labels
		html = html.replace( /(<input[^>]+?type\s*=\s*['"]?radio['"]?[^>]+>)[^<]*<\/td>[^<]*<td[^>]*>/gi, '$1' );
		// replace th, td with div
		html = html.replace( /<(\/?)(?:th|td)[^>]*>/gi, '<$1div>' );

		form.html( html );

		// force radio buttons inline for IE6
		form.find( 'input' ).filter( ':radio' ).css({
			'display' : 'inline',
			'border' : 'none'
		});

			
	} else {
		// remove tables (except the strcturetable rivtable on job listings)
			$( 'table' ).not( 'table.structuretable table.rivtable, table table.vrivtable, table.tabledata, table#search-results' ).exterminateLayoutTable();
		
	}
	
	
	
	// privacy checkbox
	$( 'input[name=in_privacy]' ).each(function() {
		$( this )
			.css({ 'margin-right': '.5em' })
			.parent().next()
				.prepend( this )
				.find( 'br' ).remove();
	});

	// pretty buttons
	$( '#page-container :submit, input[type=button], input[type=reset]' ).wrap( '<span class="actions" style="display: inline; margin-right: 1em"/>' );
	// primary action (not asides)
	$( '#content form' ).each(function() {
		$( this ).find( ':submit' ).eq( 0 ).wrap( '<strong/>' );
	});
	$( ':submit[value="Apply online"], :submit[value="Save"]' ).wrap( '<strong/>' );
	$( ':submit[value="View selected"]' ).not( 'strong :submit' ).wrap( '<strong/>' );
	$( 'form :submit[value$=later]' ).closest( 'form' ).find( ':submit[value=Submit]' ).wrap( '<strong/>' );
	// these aren't really primary actions
	$( 'strong :submit[value=Previous], strong :submit[value^=Return], strong :submit[value=Logout], strong :submit[value$=later], strong :submit[value=Delete], strong :submit[value=Test]' ).unwrap();


	// data tables
	$( 'table.tabledata' ).prepend( '<thead/>' );
	$( 'table.tabledata tr' ).eq( 0 ).each(function() {
		$( this ).closest( '.tabledata' ).find( 'thead' ).append( this );
	});
	// remove form wrapper
	$( 'table.tabledata' ).closest( '.form' ).children().eq( 0 ).unwrap();

	// better hide this (artifact in FF8)
	$( ':submit' ).closest( '.form' ).next( '.form' ).hide();


	// taming selects
	$( 'select' ).css({
		'max-width': '100%',
		overflow: 'hidden'
	});


	// login, logout spelling
	$( 'input[value=Logon]' ).val( 'Log in' );
	$( 'input[value=Logout]' ).val( 'Log out' );

/*
	// lightbox for @href windows
	$( 'a[href^="javascript:openNewWin"]' ).each(function() {
		this.href = this.href.replace( /^javascript\:openNewWin\(['"]([^'"]+).*$/, '$1' );
	}).addClass( 'definition' );

	// lightbox for @onclick windows
	$( 'a[onclick^="javascript:openNewWin"]' ).each(function() {
		this.href = this.getAttribute( 'onclick' ).replace( /^javascript\:openNewWin\(['"]([^'"]+).*$/, '$1' );
	}).removeAttr( 'onclick' ).unbind( 'click' ).addClass( 'definition' );

	// need #contentnonav for /site/terms.html link
	$( 'a[href$="/site/terms.html"]' ).each(function() {
		this.href = this.href + '#contentnonav';
	})

	// map window.close to history.back
	// window.close = window.history.back;
*/


	// status messages
	$( 'p:contains(Are you sure you want your account to be deleted?)' ).wrap( '<div class="status warn"></div>' );
	$( 'p.message' ).filter( ':contains(password must be entered)' ).wrap( '<div class="status warn"></div>' );
	$( 'p.message' ).filter( ':contains(password is incorrect)' ).wrap( '<div class="status warn"></div>' );
	$( 'p' ).filter( ':contains(jobs were found matching the search criteria of your profile)' ).wrap( '<div class="status info"></div>' );
	$( '.warn' ).filter( ':contains(Your Job Alert Profile will be active)' ).removeClass( 'warn' ).addClass( 'success' );


	// we don't use these
	$( 'hr' ).remove();


	// don't need to see this
		$( '#containerdiv' ).hide();


	// on ready
	$(function() {
		
		// nfi what this is (FF8)
			$( 'a > option' ).parent().remove();
		/*
		// Clean up cruft on some pages
			if ( /JnCustomDailyEmail\.userEmailProfile/.test( location.pathname )) {
				
				// Loop through nodes in #containerdiv
				$('#containerdiv').contents().each(function(){
					//if (typeof console !== 'undefined' && typeof console.log !== 'undefined') {
					//	console.log (typeof this);
					//	console.log (this.nodeType);
					//	console.log (this);
					//}
					
					// Remove all dissassociated text nodes
						if (this.nodeType === 3) {
							$(this).remove();
						}
					
				});
				
			}
		*/
	});


}( jQuery ));


}
