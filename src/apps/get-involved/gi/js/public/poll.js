$(function() {
	$('div.barchart').each(function() {
		$(this).simplebar({value: parseFloat($(this).text())});
	});

	$('#polls fieldset').find('input,select').change(function() {
		$('#polls\\:pollVote').boolAttr('disabled', !$('#polls fieldset').find('input:checked,select').val());
	}).change();
	var cookieName = 'poll_timer';
	$('#polls\\:pollVote').click(function() {
		if (!$('#polls fieldset').find('input:checked,select').val()) {
			alert(messages.voteError);
			return false;
		}
		var pollId = $('input[name="pollId"]').val();
		if ($.cookie(cookieName + pollId) != null) {
			$('#pollTimerText').show();
			return false;
		}
		var expireTime = new Date(new Date().getTime() + 120000);
		var cookieOption = { expires: expireTime, path: contextPath, secure: false };
		$('#' + $.cookie(cookieName + pollId, expireTime.getTime(), cookieOption)).addClass("pollTimer");
		$('#pollTimerText').hide();
		return true;
	});
});
