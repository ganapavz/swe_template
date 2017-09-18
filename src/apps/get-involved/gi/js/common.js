// E-mail regular expression
var EMAIL_REGEXP = /^[A-Za-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/;

// Global defaults for WYSIWYG editor
var WYSIWYG_OPTIONS = {height: 150, toolbar: 'GI',
		toolbar_GI: [['Bold', 'Italic', '-', 'BulletedList', 'NumberedList', '-',
			'Link', 'Unlink', '-', 'Indent', 'Outdent', '-', 'Cut', 'Copy', 'Paste']]};

var Browser = {
  Version: function() {
    var version = 999;
    if (navigator.appVersion.indexOf("MSIE") != -1)
      // IE again, lets downgrade to version number
      version = parseFloat(navigator.appVersion.split("MSIE")[1]);
    return version;
  }
}

$(function() {
	linkErrors();
	if ($.datepicker) {
		$.datepicker.setDefaults({dateFormat: 'dd/mm/yy', changeMonth: true, changeYear: true,
			showOn: 'both', buttonImage: contextPath + '/img/calendar-blue.gif', buttonImageOnly: true});
	}
	if ($.timeEntry) {
		$.timeEntry.setDefaults({spinnerImage: contextPath + '/img/spinnerBlue.png',
			spinnerBigImage: contextPath + '/img/spinnerBlueBig.png'});
	}
});

// Strip markup from a WYSIWYG field
function stripMarkup(text) {
	return text.replace(/<[^>]*>/g, '');
}

// Link error messages to their fields

//Link error messages to their fields
function linkErrors() {

	var labels = $('legend.fieldLabel span.label, label.fieldLabel span.label, fieldset.horizontal legend span.label, th.subquestion'); // Normal field labels
	labels = labels.add($('div.fieldValue label').filter(function() { // Labels within fieldsets
			return $(this).closest('table').length == 0; // But not those in a table
		}));
	$('div.status li').each(function() {
		var message = $(this);

		// Compare against label text
		labels.each(function() {
			var label = $(this);
			var truncatedLabelText = $.trim(label.text().replace(/^\d+\. /, ''));

			if (message.text().indexOf("##") >= 0){
				var labelQuesId = (label.closest('div[id]').attr('class')).replace(/^.*q(.*).*$/m, '$1');
				var labelText = message.text().replace(/^.*@(.*)\.*$/m, '$1');
				labelText = labelText.replace("\\","");
				var msgQuesId = message.text().replace(/^.*##(.*)@.*$/m, '$1');
				var finalMsg = message.text().replace(/^.*@(.*).*$/m, '$1');
				finalMsg = finalMsg.replace("\\","");
				var index = labelText.indexOf(':');
				if (index >= 1){
					labelText = labelText.substr(0, index);
				}
				if (labelText == truncatedLabelText) {
					// Link to containing div with @id
					if(labelQuesId.length > 0){
						if(labelQuesId == msgQuesId){
							message.text(finalMsg);
							message.wrapInner('<a href="#' + label.closest('div[id]').attr('id') + '"/>');
							return false;
						}
					}
					else {
						message.wrapInner('<a href="#' + label.closest('div[id]').attr('id') + '"/>');
						return false;
					}
				}
			} else if (message.text().indexOf("#$") >= 0){
				var labelQuesId = (label.closest('div[id]').attr('class')).replace(/^.*q(.*).*$/m, '$1');
				var finaltext = "";
				var index = message.text().indexOf('@');
				if (index >= 1){
					finaltext = message.text().substr(3, index - 3 );
					if (Browser.Version() < 9) {
						finaltext = message.text().substr(2, index - 2 );
					}
					finaltext = finaltext.replace("\\","");
					if (finaltext == truncatedLabelText) {
						// Link to containing div with @id
						message.text(message.text().substr(index + 1));
						message.wrapInner('<a href="#' + label.closest('div[id]').attr('id') + '"/>');
						return false;
					}
				}
			}
			else{
				var labelText = message.text().replace(/^.*@(.*):.*$/m, '$1');
				var index = labelText.indexOf(':');
				if (index >= 1){
					labelText = $.trim(labelText.substr(0, index));
				}
				labelText = labelText.replace("\\","");
				if(labelText == truncatedLabelText){
					message.wrapInner('<a href="#' + label.closest('div[id]').attr('id') + '"/>');
					return false;
				}
			}
		});
	});
}

// Create buttons for dialogs
function createButtons(btn1Text, btn1Function, btn2Text, btn2Function) {
	var buttons = {};
	buttons[btn1Text] = btn1Function;
	if (btn2Text) {
		buttons[btn2Text] = btn2Function;
	}
	return buttons;
}

//Restyle dialog buttons to follow CUE
function dialogCUEButtons(event, ui) {
	var dialog = $(this).dialog('widget');
	dialog.find('div.ui-dialog-buttonset').addClass('buttonOrder').find('button:first').addClass('primary');
	if (dialog.find('div.ui-dialog-buttonset button').length == 1) {
		return;
	}
	var cancel = dialog.find('a.cancel');
	if (cancel.length != 0) {
		return;
	}
	cancel = dialog.find('button:last');
	cancel.replaceWith('<a class="cancel" href="#">' + cancel.text() + '</a>');
	dialog.find('div.ui-dialog-buttonset a').click(function() {
			$(this).closest('div.ui-dialog').find('div.dialog').dialog('close');
			return false;
		});
}

//Handle Boolean attributes correctly
$.fn.boolAttr = function(name, value) {
	return this.each(function() {
		if (value) {
			$(this).attr(name, true);
		}
		else {
			$(this).removeAttr(name);
		}
	});
};
