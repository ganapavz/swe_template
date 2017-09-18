/* global qg*/
$(function(){
	'use strict';

	var delay = 2000;
	$('.beforeafter').each(function(){
		$(this).beforeAfter({
			animateIntro : true,
			introDelay : delay,
			introDuration : 500,
			showFullLinks : true,
			imagePath : qg.swe.paths.assets + 'images/skin/'
		});
		delay += 250;
	});
});