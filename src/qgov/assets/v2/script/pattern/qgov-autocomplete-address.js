/*global jQuery,google*/

var initAutocompleteAddress;

(function($){
	'use strict';

	var inputLocationId = 'location-autocomplete',
		addressFormId = 'address-autocomplete',
		getLocationEle = $('.app-geocoding'),
		inputLocationEle = document.getElementsByClassName(inputLocationId),
		dataStrictBounds;
	initAutocompleteAddress = function() {
		if (inputLocationEle.length>0) {
			var qldBounds = new google.maps.LatLngBounds(
				new google.maps.LatLng(-29, 138.0578426),
				new google.maps.LatLng(-9.9339, 153.63831));


			$.each(inputLocationEle,function(){
				dataStrictBounds = $(this).data('strictbounds')===true?true:($(this).data('strictbounds')===false?false:true);
				var options = {
					bounds: qldBounds,
					strictBounds: dataStrictBounds,
					types: ['geocode']
				},
					autocomplete = new google.maps.places.Autocomplete(this, options);
				// autocomplete.getPlace();
				if($(this).siblings('.'+addressFormId).length > 0) {
					var form = $(this).siblings('.'+addressFormId),
						fillInAddress = function () {
						var formFields = {
								street_number: {dataType:'street',name:'short_name'},
								route: {dataType:'street',name:'long_name'},
								locality: {dataType:'city',name:'long_name'},
								administrative_area_level_1: {dataType:'state',name:'short_name'},
								country: {dataType:'country',name:'long_name'},
								postal_code: {dataType:'zip',name:'short_name'}
							},
							loc = autocomplete.getPlace();

						//clear form
						$.each(formFields, function(i,v){
							// $('#'+v.dataType).val('');
							form.find('input[data-type="'+v.dataType+'"]').val('');
						});

						for (var i = 0; i<loc.address_components.length; i++) {
							// console.log(loc.address_components[i].types[0]);
							var type = loc.address_components[i].types[0];

							if(formFields[type] !== undefined && formFields[type].dataType !== undefined) {
								var inputEle = form.find('input[data-type="'+formFields[type].dataType+'"]');
								if(inputEle.length>0) {
									var val = inputEle.val() + ' ' + loc.address_components[i][formFields[type].name];
									inputEle.val(val);
									// console.log(inputEle);
								}

								// console.log($(formFields[type].id));
							}
						}
					};

					autocomplete.addListener('place_changed', fillInAddress);
				}
			});

			//Get current location
			if(getLocationEle.length>0) {
				$.each(getLocationEle, function(){
					$(this).on('click', function (event) {
						if (navigator.geolocation) {
							var showLocation = function (position) {
								var latitude = position.coords.latitude;
								var longitude = position.coords.longitude;
								var latlng = {lat: parseFloat(latitude), lng: parseFloat(longitude)};
								var geocoder = new google.maps.Geocoder();
								geocoder.geocode({'location': latlng}, function(results, status) {
									if (status === 'OK') {
										if (results[1]) {
											if($(this).siblings('.'+inputLocationId).length>0) {
												$(this).siblings('.'+inputLocationId).val(results[1].formatted_address);
											}
										} else {
											window.alert('No results found');
										}
									} else {
										window.alert('Geocoder failed due to: ' + status);
									}
								});
							};
							var errorHandler = function (err) {
								if(err.code === 1) {
									alert('Error: Access is denied!');
								}

								else if( err.code === 2) {
									alert('Error: Position is unavailable!');
								}
							};
							var options = {timeout:60000};
							navigator.geolocation.getCurrentPosition(showLocation, errorHandler, options);
						} else {
							// Browser doesn't support Geolocation
							window.alert('Your browser doesnot support Geolocation');
						}
						event.preventDefault();
					});
				});
			}
		}
	};

}(jQuery));

initAutocompleteAddress();
