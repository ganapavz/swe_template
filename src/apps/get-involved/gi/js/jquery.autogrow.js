(function($) {

function grow(txtArea, options) {
	var cols = txtArea.cols;
	var linesCount = 1;
	var lines = txtArea.value.split('\n');
	for (var i = lines.length - 1; i >= 0; --i) {
		linesCount += Math.floor(lines[i].length / cols) + 1;
	}
	txtArea.rows = Math.max(linesCount, options.minRows);
}

$.fn.autoGrow = function(options) {
	options = $.extend({minRows: 4}, options || {}); 
	return this.each(function() {
		$(this).keyup(function() {
			grow(this, options);
		});
		grow(this, options);
	});
};

})(jQuery);