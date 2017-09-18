$(function() {
	// Other choices
	$('input.otherSpecify').each(function() {
		var otherSpecify = $(this);
		otherSpecify.siblings('select').change(function() {
			otherSpecify.toggle($(this).val() == messages.other); 
		}).change();
		otherSpecify.parent().find('input:checkbox:last').change(function() {
			otherSpecify.toggle($(this).is(':checked')); 
		}).change();
		otherSpecify.parent().find('input:radio').change(function() {
			otherSpecify.toggle($(this).val() == messages.other); 
		}).change();
	});
	$('.otherSpecify').hide();
	$('input.otherSpecify').hide();
	// Ranking choices
	$('ol.ordered + input:hidden').each(function() {
		var currentHidden = $(this);
		var currentList = currentHidden.prev('ol');
		currentList.prepend('<li class="cutoff"><input style="visibility: hidden"/>' + messages.cutOff + '</li>');
		if (currentHidden.val()) { // Restore selected order
			var splitHidden = currentHidden.val().split('|');
			for (var i = splitHidden.length - 1; i >= 0; i--) {
				currentList.find('li').filter(function() {
						return $.trim($('label', this).text()) == splitHidden[i];
					}).prependTo(currentList);
			}
		} 
	});
	$('ol.ordered').each(function() {
		var ol = $(this);
		ol.sortable({stop: function(event, ui) {
			renumberItems(ui.item.parent('ol'));
			ui.item.hide().show();
		}}).
		find('li').prepend('<img src="' + contextPath + '/img/order.gif" alt="' + messages.drag + '" title="' + messages.drag + '"/>').
		find('input').keydown(function(e) {
			var li = $(this).closest('li');
			switch (e.keyCode) {
				case 38: // Up key
					li.insertBefore(li.prev());
					renumberItems(li.parent());
					break;
				case 40: // Down key
					li.insertAfter(li.next());
					renumberItems(li.parent());
					break;
			}
			$(this).focus();
		}).change(function() {
			var ol = $(this).closest('ol');
			var li = $(this).closest('li')[0];
			var lis = ol.find('li').
				map(function() {
					var val = $(this).hasClass('cutoff') ? 1e6 - 1 :
						parseInt($(this).find('input').val(), 10);
					val = isNaN(val) || val === '' ? 1e6 : val - (this == li ? 0.5 : 0) ;
					return {li: this, val: val};
				}).
				get().sort(function(a, b) {
					return a.val - b.val;
				});
			$.each(lis, function() {
				$(this.li).appendTo(ol);
			});
			renumberItems(ol);
		}).first().change();
	});
	// Textareas
	$('#content textarea').each(function() {
		var max = $(this).next('span.initMaxLength').text();
		$(this).maxlength({max: max}).autoGrow({minRows: Math.min(20, max / 100)});
	});
	// RatingMatrix stripes
	$('table.ratingMatrix > tbody > tr:odd').css('background-color', '#EDF6FF');
	// Demographics
	$('#consultationResponse\\:demographicsDiv\\:outsideAustralia').change(function() {
			if ($(this).is(':checked')) {
				$('#consultationResponse\\:demographicsDiv\\:location').attr('disabled', true);
			}
			else {
				$('#consultationResponse\\:demographicsDiv\\:location').removeAttr('disabled');
			}
		}).change();
	// Contacts
	var contactMe = $('#consultationResponse\\:contactMeDiv\\:contactMe').change(function() {
			$('div.contacts').toggle(contactMe.is(':checked'));
			$(window).triggerHandler('resize');
			$('#consultationResponse\\:contactsMethodDiv\\:viaEmail,#consultationResponse\\:contactsMethodDiv\\:viaPhone,#consultationResponse\\:contactsMethodDiv\\:viaPost').change();
		});
	contactMe.change();
	$('#consultationResponse\\:contactsMethodDiv\\:viaEmail').change(function() {
			$('div.contactEmail').toggle($(this).is(':checked') && contactMe.is(':checked'));
		}).change();
	$('#consultationResponse\\:contactsMethodDiv\\:viaPhone').change(function() {
			$('div.contactPhone').toggle($(this).is(':checked') && contactMe.is(':checked'));
		}).change();
	$('#consultationResponse\\:contactsMethodDiv\\:viaPost').change(function() {
			$('div.contactPost').toggle($(this).is(':checked') && contactMe.is(':checked'));
		}).change();
	$('#sameAsAboveEmail').change(function() {
		var same = $(this).is(':checked');
		if (same && $('#consultationResponse\\:moderationEmailDiv\\:moderationEmail').val().length > 0) {
			$('#consultationResponse\\:contactsEmailDiv\\:contactEmailAddress').val($('#consultationResponse\\:moderationEmailDiv\\:moderationEmail').val());
		}
		if (same && $('#consultationResponse\\:moderationEmailDiv\\:moderationEmail').val().length == 0) {
			$('#contactEmailAddressError').show();
		} else {
			$('#contactEmailAddressError').hide();
		}
		if (!same) {
			$('#contactEmailAddressError').hide();
		}
	});
	$('#sameAsAbovePost').change(function() {
		var same = $(this).is(':checked');
		//$('div.contactPost input:not(:checkbox)').boolAttr('disabled', same);
		if (same) {
			$('#consultationResponse\\:contactsPostDiv\\:postalLine1').val($('#consultationResponse\\:addressDiv\\:line1').val());
			$('#consultationResponse\\:contactsPostDiv\\:postalLine2').val($('#consultationResponse\\:addressDiv\\:line2').val());
			$('#consultationResponse\\:contactsPostDiv\\:postalLine3').val($('#consultationResponse\\:addressDiv\\:line3').val());
			$('#consultationResponse\\:contactsPostDiv\\:postalCity').val($('#consultationResponse\\:addressDiv\\:city').val());
			$('#consultationResponse\\:contactsPostDiv\\:postalState').val($('#consultationResponse\\:addressDiv\\:state').val());
			$('#consultationResponse\\:contactsPostDiv\\:postalPostcode').val($('#consultationResponse\\:addressDiv\\:postcode').val());
			$('#consultationResponse\\:contactsPostDiv\\:postalCountry').val($('#consultationResponse\\:addressDiv\\:country').val());
		}
	});
	// Publication
	$('#consultationResponse\\:privateResponseDiv\\:privateResponse input').change(function() {
		$('#consultationResponse\\:moderationEmailDiv input').boolAttr('disabled', !$('#consultationResponse\\:privateResponseDiv\\:privateResponse\\:1').is(':checked'));
		$('#sameAsAboveEmail').attr('checked', !$('#consultationResponse\\:privateResponseDiv\\:privateResponse\\:1').is(':checked'));
	}).filter(':first').change();
	
	// For notify me.
	$(window).triggerHandler('resize');
	
	// Dialog and timer for session timeout
	setTimeout(saveUnfinishedBeforeTimeout, 2400000);
	
	$('#sessionTimeoutDialog').dialog({autoOpen: false, modal: true, width: 640,
		buttons: createButtons(
			messages.save, function() {
				$(this).dialog('close');
				$('input.finishLater').click();
			},
			messages.cancel, function() {
				$(this).dialog('close');
			}
		),
		open: dialogCUEButtons
	});
});

function saveUnfinishedBeforeTimeout() {
	setTimeout(function() {
		$('#sessionTimeoutDialog').dialog('close');
		$('input.finishLater').click();
	}, 150000);
	
	$('#sessionTimeoutDialog').dialog('open').
		dialog('widget').find('div.ui-dialog-buttonpane button').removeAttr('disabled');
}

function renumberItems(ol) {
	var cutoff = false;
	var items = '';
	ol.find('li').each(function(i) {
		var li = $(this);
		if (li.hasClass('cutoff')) {
			cutoff = true;
		}
		else {
			li.find('input').val(cutoff ? '' : i + 1);
			if(!cutoff) {
				items += '|' + $.trim(li.text());
			}
		}
	});
	ol.next('input:hidden').val(items.substring(1));
}

function inList(elem, list) {
	var values = $(elem).closest('div.fieldValue').find('select,input:checked').map(function(i, e) {
			return $(e).val();
		}).get();
	var found = false;
	$.each(values, function(i, v) {
		if ($.inArray(v, list) != -1) {
			found = true;
			return !found;
		}
	});
	return found;
}

