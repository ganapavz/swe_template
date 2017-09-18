(function( $ ) {
	'use strict';

	// window.console.log( 'file-size-validation.js' );

	var displayFileSize;


	// bail out if no file API support
	if ( typeof $( '<input type="file">' )[ 0 ].files !== 'object' ) {
		// duplicate fsize instruction before submit button
		$( '.max-fsize' ).each(function() {
			var fsize = $( this ), form;
			form = fsize.closest( '.preamble' ).nextAll( 'form' ).eq( 0 );
			form.find( '.actions' ).before( '<p>' + fsize.parent().html() + '</p>' );
		});
		return;
	}


	// display file size
	displayFileSize = function( input ) {
		input.nextAll( '.fsize' ).remove();
		if ( input[ 0 ].files.length > 0 ) {
			var filesize = input[ 0 ].files[ 0 ].size / 1024;

			if ( filesize >= 1024 ) {
				filesize = filesize / 1024;
				input.after( '<span class="fsize">File size: ' + ( Math.round( filesize * 10 ) / 10 ) + 'MB' + '</span>' );
			} else {
				input.after( '<span class="fsize">File size: ' + ( Math.round( filesize * 10 ) / 10 ) + 'KB' + '</span>' );
			}
		}
	};


	// forms with max file size
	$( '.max-fsize' ).each(function() {
		var fsize = $( this ),
			form,
		    maxFileSize
		;

		// read fsize, assume MB
		maxFileSize = parseInt( fsize.text().replace( /\D+/g, '' ), 10 ) * 1024 * 1024;
		// window.console.log( 'found max fsize', maxFileSize );

		// get form (closest form after the preamble)
		form = fsize.closest( '.preamble' ).nextAll( 'form' ).eq( 0 );

		form.find( ':file' ).on( 'change', function() {
			var input = $( this );

			displayFileSize( input );

			// recalculate file sizes
			var total = 0, valid;
			$( ':file', this.form ).each(function( index, element ) {
				var size = element.files.length ? element.files[ 0 ].size : 0;
				total += size; // total = total + size;
			});

			// is everything valid or invalid?
			valid = total <= maxFileSize;

			// window.console.info( 'file size validation:', total, '<', maxFileSize, total < maxFileSize );

			$( ':file', this.form )
			// update validity for :file inputs with values
			.filter(function() {
				return !! this.value;
			})
			.each(function( index, element ) {
				element.setCustomValidity( valid ? '' : 'Attachments are too large' );
			})
			// blank :file inputs should not have a custom error
			.filter(function() {
				return ! this.value;
			})
			.each(function( index, element ) {
				element.setCustomValidity( '' );
			});

		});

	});

}( jQuery ));
