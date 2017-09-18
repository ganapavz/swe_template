$('#nav-section ul')
	.children(':nth-child(6n-5)').addClass('nth-child-1').end()
	.children(':nth-child(6n-4)').addClass('nth-child-2').end()
	.children(':nth-child(6n-3)').addClass('nth-child-3').end()
	.children(':nth-child(6n-2)').addClass('nth-child-4').end()
	.children(':nth-child(6n-1)').addClass('nth-child-5').end()
	.children(':nth-child(6n)').addClass('nth-child-6').end()
;



$('#consultation .aside-inner').compact(options={
	type: 'tabbed'
});

$('#topics').compact(options={
	type: 'tabbed',
	variableHeight : true
});


	// Flex grid for industry sectors
		$('#ia > div > ul').flexGrid('li');

