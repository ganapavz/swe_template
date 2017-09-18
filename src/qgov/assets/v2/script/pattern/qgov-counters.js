/*global jQuery,google,MarkerClusterer,qg*/

// global callback
var initMaps, info;


// closure
(function( $,swe ) {
	'use strict';

	var fillFormWithUrlParams, addDataToMap, geocodeAddress, getData, getURLParams, getDistance, filterCounter, triggerAddDataToMap, displayResults, processTemplate, displayProcessedResults, noResults,
		jsonData, getDataResult, map, markerClusterer, flag = false, searchForm = $( 'form', '#content,#asides' ),
		// addressElement = $('#location'),addressAutocomplete,
		mapReady = false,
		dataReady = false,
		dataElement = $('#data-url'),
		dataUrl = dataElement.data('url'),
		resourceId = dataUrl.split('resource/')[1],query,
		dataset = dataElement.data('set') || '', resultsContainer = $('#search-results-container'), resultsListId = '#search-results',
		domain = dataUrl.indexOf('staging.data.qld.gov.au')>=0 ? 'staging.data.qld.gov.au' : 'data.qld.gov.au',
		geocoder
		// ,googleApiKey
	;

	//URL Parameters
	var location = '',
		distance = 100, //100 km default
		type='';


	//Using Google API key
	// googleApiKey = window.location.hostname==='www.qld.gov.au'? 'AIzaSyDH8T8XP9YD9CdKpvPW5YUGRudUNj-MR3Q' : 'AIzaSyCKuaFIFo7YYZXHZ5zaiEZdJx0UBoyfuAE';
	// googleApiKey = window.location.hostname==='www.qld.gov.au'? 'AIzaSyDH8T8XP9YD9CdKpvPW5YUGRudUNj-MR3Q' : 'AIzaSyCKuaFIFo7YYZXHZ5zaiEZdJx0UBoyfuAE';	//legacy
	// var ele = document.createElement('script');
	// ele.setAttribute('src','https://maps.googleapis.com/maps/api/js?Key='+googleApiKey+'&callback=initMaps&region=AU');
	// document.write('<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCKuaFIFo7YYZXHZ5zaiEZdJx0UBoyfuAE&amp;callback=initMaps"></script>');
	// $('body').append(ele);

	// add data to the map
	addDataToMap = function() {
		var i = 0,
			markers = {},
			zoomRadius = ( jsonData.location.length === 2 ? 5 : 0 ),

			addMarkerLink = function( list, title ) {
				var a = $( '<a href="view/?title=' + encodeURIComponent( title ) + '"></a>' );
				a.text( title );
				a.wrap( '<li/>' ).parent().appendTo( list );

				return list;
			}
		;

		// do we have a location?
		if ( zoomRadius ) {
			map.setCenter( new google.maps.LatLng( jsonData.location[ 0 ], jsonData.location[ 1 ] ));
		}

		// loop through counters
		$.each( jsonData.matches, function( key, counter ) {
			var latlong = counter.Latitude + ',' + counter.Longitude,
				marker;

			// put it on the map?
			if ( ! counter.Latitude ) {
				return;
			}
			if ( markers[ latlong ] ) {
				// already have a marker at this position
				// make the info popup list all counters at this marker?
				addMarkerLink( markers[ latlong ], counter.Title );
				return;
			} else {
				// track it
				markers[ latlong ] = addMarkerLink( $( '<ul></ul>' ), counter.Title );
			}

			// zoom to the 2 nearest counters
			if ( zoomRadius && counter.Distance > zoomRadius ) {
				if ( i > 1 ) {
					// zoom to markers
					markerClusterer.fitMapToMarkers();
					// centre the map on the search location (may hide some markers, but matches user intent)
					map.panTo( new google.maps.LatLng( jsonData.location[ 0 ], jsonData.location[ 1 ] ));
					// flag to stop checking radius/distance
					zoomRadius = 0;
				} else {
					// increase the radius
					zoomRadius = counter.Distance + 10.0;
				}
			}

			marker = new google.maps.Marker({
				position: new google.maps.LatLng( counter.Latitude, counter.Longitude ),
				title: counter.Title,
				visible: true,
				animation: google.maps.Animation.DROP,
				map: map
			});

			// marker click, show info box
			google.maps.event.addListener( marker, 'click', function() {
				// info box already visible?
				if ( info ) {
					info.close();
				}

				info = new google.maps.InfoWindow({ content: markers[ latlong ].get( 0 ) });
				info.open( map, marker );
			});

			markerClusterer.addMarker( marker );

			i++; // count it

		});
	};


	//Google Autocomplete address

	// addressAutocomplete = function(ele){
	// 	var autocomplete = new google.maps.places.Autocomplete(ele);
	// 	// autocomplete.bindTo('bounds', map);
	// 	console.log(autocomplete);
	// };

	// initialise map with data
	initMaps = function() {
		fillFormWithUrlParams();
		// if(addressElement.length>0){
		// 	addressElement.focus(function(){google.maps.places.Autocomplete($(this));});
		// 	// addressAutocomplete(addressElement);
		// }
		var mapResize = function() {
				google.maps.event.trigger( map, 'resize' );
			},
			myOptions = {
				zoom: 5,
				center: new google.maps.LatLng( -23, 143 ), // Qld = -23, 143?
				mapTypeId: google.maps.MapTypeId.ROADMAP // ROADMAP, SATELLITE, HYBRID, TERRAIN
			}
		;

		geocoder = new google.maps.Geocoder();

		$( 'form', '#content' ).eq( 0 ).before( '<div id="canvas"></div>' );
		$( '#canvas' ).append( '<div id="map_canvas"></div>' );

		map = new google.maps.Map( document.getElementById( 'map_canvas' ), myOptions );
		markerClusterer = new MarkerClusterer( map, null, {
			imagePath: qg.swe.paths.assets + 'images/skin/map-marker/m',
			imageSizes: [ 53, 56, 66, 78, 90 ],
			imageExtension: 'png'
		});

		getURLParams();

		if ( dataReady ) {
			addDataToMap();
		}
		mapReady = true;

		// handle resizing
		window.ResizeEvents.bind( 'x-window-width-resize', mapResize );

		// lightbox
		$( '#canvas' ).after( '<a id="butterfly-map" href="#canvas">View fullscreen</a>' );
		$( '#butterfly-map' ).butterfly({
			contentDefaultWidth: '90%',
			contentDefaultHeight: '90%',
			reuseFragment: true,
			callbackPostResize: mapResize,
			callbackPostOpen: mapResize,
			callbackPostClose: mapResize
		});
	};

	// processTemplate = function(template,data){
	// 	var resultsList = $(resultsListId),
	// 		eleHtml='';

	// 	$(template).each(function(){
	// 		var ele = $(this).html();
	// 		if(ele) {
	// 			ele = ele.replace(/\[\[(.*?)\]\]/g, function (matched, key) {
	// 				var ele1 = key.replace(/\{\{(.*?)\}\}/g, function (m) {
	// 					var column = m.match(/{{(.*)}}/).pop().split(':')[1] !== undefined ? m.match(/{{(.*)}}/).pop().split(':')[1] : m.match(/{{(.*)}}/).pop();
	// 					if(data[column] !== undefined && data[column].trim().length>0 ) {
	// 						// return data[k];
	// 						return swe.template.process(m,data);
	// 					}
	// 					else {
	// 						return 'invalid';
	// 					}

	// 				});
	// 				if(ele1.indexOf('invalid')<0) {
	// 					return ele1;
	// 				}
	// 				else {
	// 					return '';
	// 				}
	// 			});
	// 			eleHtml+=ele;
	// 		}
	// 	});
	// 	resultsList.append('<li>'+eleHtml+'</li>');
	// };

	processTemplate = function(template,data){
        var eleHtml='';
        $(template).each(function(){
            var ele = $(this).html();
            if(ele) {
                ele = ele.replace(/\[\[(.*?)\]\]/g, function (matched,key) {
                    var validDataFlag = true; //this flag is set to view id data of mentioned column is available. else it return blank string.
                    $.each(key.match(/\{\{(.*?)\}\}/g),function(k,v){
                        var column = v.match(/{{(.*)}}/).pop().split(':')[1] !== undefined ? v.match(/{{(.*)}}/).pop().split(':')[1] : v.match(/{{(.*)}}/).pop();
                        if (column === 'googleApiKey' || column === 'Closure') {
                            validDataFlag = true;
                        }
                        else if(data[column] === undefined || data[column] === null || data[column].trim().length === 0) {
                            validDataFlag = false;
                        }
                    });
                    if(validDataFlag) {
                        var html = swe.template.process( key, data );
                        return /\{\{(.*?)\}\}/.test(html) ? '' : html;
                    }
                    else {
                        return '';
                    }
                });
                eleHtml+=ele;
            }
        });
        return eleHtml;
    };

	displayResults = function(){
		var template, templateUrl = '';


		if(dataElement.data('search-template') !== undefined && dataElement.data('search-template').length>0){
			templateUrl = dataElement.data('search-template');
		}
		else if($(resultsListId).children().length>0){
			template = $(resultsListId).html();
		}
		else {
			switch (dataset) {
				case 'qgap': {
					    templateUrl = '/assets/includes/dynamic/counters/search-result-qgap.html';
					    break;
					}
				case 'housing-service-centres': {
						templateUrl = '/assets/includes/dynamic/counters/search-result-housing-service-centres.html';
						break;
					}
				default: {
						templateUrl = '/assets/includes/dynamic/counters/search-result.html';
						break;
					}
			}
		}
		if(templateUrl !== ''){

			$.get(templateUrl)
				.success(function(temp){
					displayProcessedResults(temp);
				})
				.error(function(){
					console.log('Search template not found');
				});
		}
		else {
			displayProcessedResults(template);
		}

	};

	//displays search results
	displayProcessedResults = function(temp){
		var headerHtml = '';
		$(resultsListId).html('');
		var html = '';
		for(var i=0;i<getDataResult.length;i++) {
			html+='<li>'+processTemplate(temp, getDataResult[i])+'</li>';
		}
		$(resultsListId).html(html);
		resultsContainer.pajinate({
			item_container_id: resultsListId,
			nav_panel_id: '.pagination',
			items_per_page: 10,
			num_page_links_to_display: 5,
			show_first_last: !1,
			slideTransition: !0
		});
		resultsContainer.find('.page_link').on('click',function(){	//written to continue numbering of ordered list
			var pageStart = $(this).attr('longdesc')*10;
			resultsContainer.css('counter-reset','item '+pageStart);
		});
		resultsContainer.find('.next_link, .previous_link').on('click',function(){  //written to continue numbering of ordered list
			var pageStart = resultsContainer.find('.active_page').attr('longdesc')*10;
			resultsContainer.css('counter-reset','item '+pageStart);
		});
		headerHtml = (typeof location !== 'undefined' && location.length>0) ? ' near <em><strong>\''+location+'\'</strong></em>' : '';
		if(headerHtml.length>0){
			$('.resultset-title').append(headerHtml);
		}
	};

	noResults = function(){
		var template;
		
		switch (dataset) {
			case 'housing-service-centres': {
					template = '<div class="status info"><h2>Please phone the Community Recovery Hotline</h2><p>There is no Community Recovery Centre within 50km of your location. Please phone the Community Recovery Hotline on <strong>1800 173 349</strong> for information about assistance.<p><p><a href="/community/disasters-emergencies/community-recovery-centres/">View all Community Recovery Centres</a> currently operating in Queensland.</p></div>';
					break;
				}
			default: {
					template = '<p>No results.</p>';
					break;
				}
		}
		resultsContainer.html(template);
	};
	
	getDistance = function (lat1, lon1, lat2, lon2) {
		var p = 0.017453292519943295;    // Math.PI / 180
		var c = Math.cos;
		var a = 0.5 - c((lat2 - lat1) * p)/2 +
			c(lat1 * p) * c(lat2 * p) *
			(1 - c((lon2 - lon1) * p))/2;

		return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
	};

	triggerAddDataToMap = function(){
		if(getDataResult.length>0) {
			if(!flag){
				jsonData = {
					location: '',
					matches: getDataResult
				};
				if (mapReady) {
					addDataToMap();
				}
				dataReady = true;
				flag = !flag;
				displayResults();
			}
		}
		else {
			noResults();
		}
	};

	filterCounter = function(type){
		for (var i=0; i<getDataResult.length; i++) {
			if(typeof type !== undefined && type.length>0 && typeof getDataResult[i]['Counter type'] !== undefined && getDataResult[i]['Counter type'] !== type) {
				getDataResult.splice(i,1);
				i--;
			}
		}
		triggerAddDataToMap();
	};

	geocodeAddress = function (geocoder, location) {
		var address = location, latLong = [];
		geocoder.geocode({'address': address}, function(results, status) {
			if (status === 'OK') {
				latLong.push(results[0].geometry.location.lat());
				latLong.push(results[0].geometry.location.lng());

				query = 'select *';
				query+= 'from (';
				query+= 'SELECT *, SQRT(POW(111.12 * ("Latitude" - ('+latLong[0]+')), 2) + POW(111.12 * (('+latLong[1]+') - "Longitude") * COS("Latitude" / 57.3), 2)) AS "distance" from "'+resourceId+'" ) as data ';
				query+= 'WHERE distance < '+distance+' ORDER BY "distance"';

				getData();
			}
			//Else Gavins error html
		});
	};

	getData = function() {

		// load json data
		qg.data.get(domain, query, {
			cache: !0,
			successCallback: function (data) {
				if (data.result.records.length > 0) {
					getDataResult = data.result.records;
					// getDataResult = getDataResult.sort(function(c1,c2){return c1.Distance - c2.Distance;});

					if(type!=='') {
						filterCounter(type); //remove this after developing postgre query which does that server side
					}

					triggerAddDataToMap();
				}
				else {
					noResults();
				}
			}
		});
	};

	getURLParams = function(){
		// resourceId = $('#data-url-id').data('resource-id');
		$.each(window.location.search.split('&'), function () {
			if (this.indexOf('location') > -1) {
				location = this.split('=')[1];
			}
			else if (this.indexOf('distance') > -1) {
				distance = parseInt(this.split('=')[1],10);
			}
			else if (this.indexOf('type') > -1) {
				type = this.split('=')[1];
			}
		});
		if(location!==''){	//calculate distance and append to results
			geocodeAddress(geocoder, location);
		}
		// else if(type!==''){
		// 	filterCounter(type);
		// }
		else {
			query = 'SELECT * from "'+resourceId+'"';
			getData();
			// triggerAddDataToMap();
		}
	};

	//Fill the search form with URL parameter
    fillFormWithUrlParams = function () {
        $.each($.url().param(),function (key,val) {
            var input = searchForm.find('input[name=\''+key+'\']').length>0 ? searchForm.find('input[name=\''+key+'\']') : searchForm.find('select[name=\''+key+'\']');
            var inputType = input.attr('type') || input.prop('nodeName').toLowerCase();
            switch (inputType){
                case 'checkbox' : {
                        if(typeof val !== 'object') {val = [val];}
                        $.each(val,function(i,v){
                            searchForm.find('input[name="'+key+'"][value="'+v+'"]').prop('checked','checked');
                        });
                        break;
                    }
                case 'radio' : {
                        if(typeof val !== 'object') {val = [val];}
                        $.each(val,function(i,v) {
                            searchForm.find('input[name="' + key + '"][value="' + v + '"]').prop('checked', 'checked');
                        });
                        break;
                    }
                case 'select' : {
                        searchForm.find('option[value="'+val+'"]').prop('selected','selected');
                        break;
                    }
                default:{
                        searchForm.find('input[name="'+key+'"]').val(val);
                        break;
                    }
            }
        });
    };


}( jQuery,qg.swe ));
