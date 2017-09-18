/*global jQuery,google,qg,MarkerClusterer, History*/

// global callback
var initMaps, info;

// closure
(function($, swe, History){
    'use strict';

    var
        //functions
        init,mapResize,getURLParams,queryBuilder,selectBuilder,geocodeAddress,getData,fillFormWithUrlParams,processTemplate,paginateResults, editSearchHeader,triggerAddDataToMap,
        addDataToMap,noResults,resizeDynamicContainers,loadData,formSubmission, clearForm, getSearchStateFromForm, initializeVariables, initializeMap,
        displaySearchResults, postFetchingDisplayTemplate,

        //page specific functionalities
        pageSpecFunc,

        //variables
        //config
        baseTitle = document.title,
        baseURL = window.location.href.replace( /[#?].*$/, '' ),
        //map variables
        map,mapHeight,geocoder,markerClusterer,mapReady = false,

        //html variables
        searchForm = $( 'form', '#content,#asides' ),displayTemplateHtml,resultsHTML,searchResultsContainer = $('#search-results'), viewResultTemplate = $('#view-result-container').html(),
        searchResultsParent = $('#search-results-container'),resetButton = searchForm.find('.reset'), inputLocationId = 'location',getLocationEle = $('#app-geocoding'),

        //search variables
        searchState={
            location : '',
            distance : 1000 //1000 kms by default
        },

        //CSV data variables
        dataReady = false,jsonData,flag,
        dataElement = $('#data-url'),
        dataUrl = dataElement.data('url'),
        resourceId = dataUrl.split('resource/')[1],
        dataTitleColumn = dataElement.data('title-column'),
        dataZoom = dataElement.data('zoom'),
        dataCenter = dataElement.data('center'),
        dataClusterGridSize = dataElement.data('clustergridsize'),
        dataControlsPosition = dataElement.data('controlsposition'),
		dataStrictBounds = dataElement.data('strictbounds')===true?true:(dataElement.data('strictbounds')===false?false:true),
		dataOrderby = dataElement.data('orderby') || '',
		dataset = dataElement.data('set') || '', //used to get template to display results
        // staging only supported in non-production environments
        dataEnvironment = /*swe.isProduction ||*/ dataUrl.indexOf('staging.data.qld.gov.au')>=0 ? 'staging.data.qld.gov.au' : 'data.qld.gov.au',
        getDataResult={},
        sqlCommon,sqlSelect,sqlFrom,sqlWhere,sqlOrderBy,sqlLimit, sql
        ;

    //all functions that needs to be executed on page load
    init = function () {
        initializeVariables();
        formSubmission();
    };

    // initialise map with data
    initMaps = function () {
        init();
        initializeMap();
        loadData();
    };

    //generates map elements
    initializeMap = function(){
        var center = (dataCenter=== undefined || dataCenter.trim().length===0) ? '-23,143'.split(',') : dataCenter.split(','),
            controlsPosition = (dataControlsPosition=== undefined || dataControlsPosition.trim().length===0) ? 'RIGHT_BOTTOM' : dataControlsPosition,
            gridSize = (dataClusterGridSize=== undefined || dataClusterGridSize.length===0) ? 60 : parseInt(dataClusterGridSize,10),
            myOptions = {
            zoom: 5,
            center: new google.maps.LatLng( parseFloat(center[0]),parseFloat(center[1]) ), // Qld = -23, 143?
            mapTypeId: google.maps.MapTypeId.ROADMAP, // ROADMAP, SATELLITE, HYBRID, TERRAIN
            zoomControlOptions: {
                position: google.maps.ControlPosition[controlsPosition]
            },
            streetViewControlOptions: {
                position: google.maps.ControlPosition[controlsPosition]
            }
        };

        var input = document.getElementById(inputLocationId);
        if(input){
            var qldBounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(-29,138.0578426),
                new google.maps.LatLng(-9.9339, 153.63831));

            var options = {
                bounds:qldBounds,
                strictBounds: dataStrictBounds,
                types: ['geocode']
            };
            var autocomplete = new google.maps.places.Autocomplete(input, options);
            if(dataElement.data('location')!==undefined){
                $(input).on('focus',function(){
                    var patt = new RegExp(dataElement.data('location')+'$');
                    if(!patt.test(input.value)){
                        input.value+=dataElement.data('location');
                    }
                    setTimeout(function() {
                        $(input).get(0).setSelectionRange(0, 0);
                    }, 1);
                });
            }
            autocomplete.getPlace();
        }
        mapHeight = dataset==='scd'? '475px': '';
        $( '#map-container', '#content' ).eq( 0 ).append( '<div id="canvas" style="height: '+mapHeight+'"></div>' );
        $( '#canvas' ).append( '<div id="map_canvas" ></div>' );

        //generating initial map
        map = new google.maps.Map( document.getElementById('map_canvas'), myOptions );
        markerClusterer = new MarkerClusterer( map, null, {
            imagePath: qg.swe.paths.assets + 'images/skin/map-marker/m',
            imageSizes: [ 53, 56, 66, 78, 90 ],
            imageExtension: 'png',
            gridSize: gridSize
        });

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

    //triggers functions which gets data, adds data to maps, displays results
    loadData = function () {
        getURLParams();
        clearForm();
        fillFormWithUrlParams();
        selectBuilder();
            // console.log(searchState);

        if ( dataReady ) {
            addDataToMap();
        }
        mapReady = true;
        initializeVariables(); //resets query variables
    };

    //initializes query variables
    initializeVariables = function () {
        sqlCommon = 'SELECT "Latitude","Longitude",';
        sqlSelect = {};
        sqlFrom=' FROM "' + resourceId + '" ';
        sqlWhere=' WHERE 1 = 1 ';
        sqlOrderBy='';
        sqlLimit='';
        sql='';
        getDataResult = {};
        resultsHTML='';
        jsonData='';
        flag = false;
    };

    // add data to the map
    addDataToMap = function() {
        var i = 0,
            markers = {},
            zoomRadius = ( jsonData.location.length === 2 ? 5 : 0 ),
            zoom = (dataZoom === undefined || dataZoom.length===0) ? ( jsonData.location.length === 2 ? 10 : 5 ) : dataZoom,

            addMarkerLink = function( item ) {
                var template = '',wrapper = '';
                switch (dataset) {
                    case 'scd': {
                            template = '<h4 style="font-size: 1.2em;"><strong>{{Centre name}}</strong></h4><p>{{Centre summary}}</p><div class="meta key">{{SectorIcons:Sectors}}</div><a href="?title={{Centre name}}" class="read-more" >Read More</a>';
                            wrapper = $( '<article class="map-popup"></article>' );
                            break;
                        }
                    default: {
                            template = '<li><a href="view/?title={{Title}}">{{Title}}</a></li>';
                            wrapper = $( '<ul class="map-popup"></ul>' );
                            break;
                        }
                }
                return wrapper.append($(swe.template.process(template, item)));
            }
            ;

        map.setZoom(zoom);
        // do we have a location?
        if ( zoomRadius ) {
            map.setCenter( new google.maps.LatLng( jsonData.location[ 0 ], jsonData.location[ 1 ] ));
        }

        markerClusterer.clearMarkers(); //clearing existing markers

        // loop through counters
        $.each( jsonData.matches, function( key, item ) {
            var latlong = item.Latitude + ',' + item.Longitude,
                marker;

            // put it on the map?
            if ( ! item.Latitude ) {
                return;
            }
            if ( markers[ latlong ] ) {
                // already have a marker at this position
                // make the info popup list all counters at this marker?
                // addMarkerLink( markers[ latlong ], item.Title );
                return;
            } else {
                // track it
                markers[ latlong ] = addMarkerLink( item );
            }

            // zoom to the 2 nearest counters
            if ( zoomRadius && item.Distance > zoomRadius ) {
                if ( i > 1 ) {
                    // zoom to markers
                    markerClusterer.fitMapToMarkers();
                    // centre the map on the search location (may hide some markers, but matches user intent)
                    map.panTo( new google.maps.LatLng( jsonData.location[ 0 ], jsonData.location[ 1 ] ));
                    // flag to stop checking radius/distance
                    zoomRadius = 0;
                } else {
                    // increase the radius
                    zoomRadius = item.Distance + 10.0;
                }
            }

            marker = new google.maps.Marker({
                position: new google.maps.LatLng( item.Latitude, item.Longitude ),
                title: item.Title,
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
        dataReady = false;
    };

    //resize map when container size changes
    mapResize = function () {
        google.maps.event.trigger( map, 'resize' );
    };

    //form submission event
    formSubmission = function () {
        searchForm.on( 'submit', function(  ) {
            var queryString, searchState;
            searchState = getSearchStateFromForm(); //gets search state from form
            queryString = $.map( searchState, function( value, key ) {
                var _value = null;
                if ( value && value.length > 0 ) {
                    _value = ( key === 'location' ) ? ( key + '=' + encodeURIComponent(value) ) :( (typeof value === 'object' ) ? (key + '=' + value.join('~')) : ( encodeURIComponent( key ) + '=' + encodeURIComponent( value ) ));
                }
                return _value;
            });
            History.pushState( { search: searchState }, baseTitle, queryString.length > 0 ? '?' + queryString.join( '&' ) : baseURL );
            event.preventDefault();
            return false;
        });
        resetButton.on('click',clearForm);
        if(getLocationEle.length>0) {
            getLocationEle.on('click',function(event){
                if (navigator.geolocation) {
                    var showLocation = function (position) {
                        var latitude = position.coords.latitude;
                        var longitude = position.coords.longitude;
                        var latlng = {lat: parseFloat(latitude), lng: parseFloat(longitude)};
                        var geocoder = new google.maps.Geocoder();
                        geocoder.geocode({'location': latlng}, function(results, status) {
                            if (status === 'OK') {
                                if (results[1]) {
                                    if($('#'+inputLocationId).length>0) {
                                        $('#'+inputLocationId).val(results[1].formatted_address);
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
                    searchResultsContainer.html('');
                    searchResultsParent.find('.info').addClass('visuallyhidden').removeClass('status');
                    searchResultsParent.append('<strong>Sorry, you must search for your location</strong>');
                    $('.resultset-title').addClass('visuallyhidden');
                    $('.pagination').html('');
                }
                event.preventDefault();
            });
        }
    };

    //Get URL paramaters to build Postgres query
    getURLParams = function () {
        var url = $.url();

        // delete searchState.Sectors; 
        //deleting old data
        searchState={
            location : '',
            distance : 1000 //1000km by default
        };

        $.each(url.param(), function (name, v) {
            if(typeof v === 'string' && v.split('~').length>1) {    //History.push saves url joined by '~' hence splitting here
                searchState[ name ] = v.split('~');
            }
            else {
                searchState[ name ] = v;
            }
        });
    };

    //get templates to display results and view individual result
    selectBuilder = function () {
        var templateUrl = '';

        if(dataElement.data('search-template') !== undefined && dataElement.data('search-template').length>0){
            templateUrl = dataElement.data('search-template');
        }
        else if(displayTemplateHtml !== undefined) {
            postFetchingDisplayTemplate();
        }
        else if(searchResultsContainer.children().length>0){
            displayTemplateHtml = searchResultsContainer.html();
            postFetchingDisplayTemplate();
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
                case 'scd': {
                        templateUrl = '/assets/includes/dynamic/counters/search-results-scd.html';
                        break;
                    }
                default: {
                        templateUrl = '/assets/includes/dynamic/counters/search-result.html';
                        break;
                    }
            }
        }

        if(templateUrl !== '') {

            $.when(
                $.get(templateUrl)
                    .success(function (temp) {displayTemplateHtml=temp;})
                    .error(function () {displayTemplateHtml='';})
            ).then(function () {
                postFetchingDisplayTemplate();
            })
            .fail(function (err) {
                console.log(err);
            });
        }

    };

    //after fetching display template, this function prepares sql
    postFetchingDisplayTemplate = function() {
        // searchResultsContainer.html(''); //remove if any html is present within
        sqlSelect = {};
        $.each((displayTemplateHtml).match( /\{\{.*?\}\}/g ), function( i, value ) {
            sqlSelect[ value.replace( /\{\{(?:[^|]+:)?(.+?)(?:\|.+)?\}\}/, '$1' ) ] = true;
            // additional columns that need to be retrieved
            if ( /^\{\{(?:compare|info|warn|streetAddress):/.test( value )) {
                value = value.replace( /\{\{.*?:.+?\|(.+)\}\}/, '$1' ).split( '|' );
                $.each( value, function( index, value ) {
                    // ignore string values like 'foo' or "foo"
                    if ( /^(['"]).*\1$/.test( value ) === false ) {
                        sqlSelect[ value ] = true;
                    }
                });
            }
        });
        sqlSelect = $.map( sqlSelect, function( value, name ) {
            return '"' + name + '"';
        }).join( ',' );
        // console.log(sqlSelect);
        queryBuilder();
    };

    //Build query based on url parameter
    queryBuilder = function () {
        if(searchState.query!==undefined && searchState.query.length>0){    //to add if keyword is entered in Science capability directory
            sqlSelect+= ', ts_rank_cd(_full_text,query) AS rank';
            sqlFrom+=(( searchState.query === '' ) ? '' : ', plainto_tsquery( \'english\', \'' + searchState.query + '\' ) query' ) + ' ' ;
            sqlWhere+= ('' === searchState.query ? '' : 'AND _full_text @@ query');
            sqlOrderBy+= ' ORDER BY rank DESC';

            if((/"(.*?)"/).test(searchState.query.trim())){
                sqlLimit+= ' LIMIT 1';
            }
        }
        if(searchState.Sectors!==undefined && searchState.Sectors.length>0){    //to add if sectors checkbox is selected in Science capability directory
            if(typeof searchState.Sectors !== 'object'){
                searchState.Sectors = [searchState.Sectors];
            }
            $.each(searchState.Sectors,function(index,value){
                if (index === 0) {
                    sqlWhere += ' AND ( upper("Sectors") LIKE upper(\'%' + value + '%\' )';
                }
                else {
                    sqlWhere += ' OR upper("Sectors") LIKE upper(\'%' + value + '%\' ) ';
                }
                if (index === searchState.Sectors.length - 1) {
                    sqlWhere += ' )';
                }
            });
        }
        $.each(searchState,function (key,val) { //this appends other form input values to the where clause.
            sqlWhere+=(key==='distance'?'':(key==='title'?'':(key==='query'?'':(key==='Sectors'?'':(key==='location'?'':(' AND ( upper("'+key+'") LIKE upper(\'%' + val + '%\' ))'))))));
        });
        if(searchState.title!==undefined && searchState.title.length>0){
            sqlCommon = 'SELECT * ';
            sqlSelect = '';
            sqlWhere += ' AND ( upper("'+dataTitleColumn+'") LIKE upper(\'%' + searchState.title + '%\' ))';
        }
        if(dataOrderby.length > 0) {
            if(sqlOrderBy.length > 0) {
				sqlOrderBy+=', "' + dataOrderby + '"';
            } else {
                sqlOrderBy = 'ORDER BY "' + dataOrderby + '"';
            }
        }
        if(searchState.location!==undefined && searchState.location.length>0){  //to add if location is entered
            geocoder = new google.maps.Geocoder();
            geocodeAddress(geocoder,searchState.location,sqlCommon,sqlSelect, sqlFrom, sqlWhere, sqlOrderBy, sqlLimit);
        }
        else {
            sql=sqlCommon + sqlSelect + sqlFrom + sqlWhere + sqlOrderBy + sqlLimit;
            // console.log(sql);
            getData();
        }
    };

    //Converts address to latitude,longitude & builds query & gets Data from CKAN
    geocodeAddress = function (geocoder, location, sqlCommon,sqlSelect, sqlFrom, sqlWhere, sqlOrderBy, sqlLimit) {
        var address = location, latLong = [];
        geocoder.geocode({'address': address}, function(results, status) {
            if (status === 'OK') {
                latLong.push(results[0].geometry.location.lat());
                latLong.push(results[0].geometry.location.lng());

                sql = 'select * ';
                sql+= 'from (';
                sql+= sqlCommon + sqlSelect + ', SQRT(POW(111.12 * ("Latitude" - ('+latLong[0]+')), 2) + POW(111.12 * (('+latLong[1]+') - "Longitude") * COS("Latitude" / 57.3), 2)) AS "distance" ' + sqlFrom + sqlWhere + sqlOrderBy + sqlLimit + ' ) as data ';
                sql+= 'WHERE distance < '+searchState.distance+' ORDER BY "distance"';
                // console.log(sql);
                getData(latLong);
            }
            else {
                noResults();
            }
        });
    };

    //to bring in data from CKAN
    getData = function(latLong) {
        latLong = latLong || [];
        // load json data
        qg.data.get(dataEnvironment, sql, {
            cache: !0,
            successCallback: function (data) {
                // var titleField = displayTemplateHtml.replace( /^[\s\S]*?\{\{.*?\}\}.*?\{\{(.*?)\}\}[\s\S]*$/m, '$1' );
                if (data.result.records.length > 0) {
                    getDataResult = data.result.records; //clear previous results
                    flag = false; //set to indicate change in data
                    // $.each(data.result.records, function(k,v){
                    //     getDataResult[v[titleField]] = v;
                    // });
                    if(!(searchState.title!==undefined && searchState.title.length>0)) {
                        displaySearchResults();
                        resizeDynamicContainers(searchResultsContainer);
                        searchResultsParent.removeClass('visuallyhidden');
                        $('#view-result-container').addClass('visuallyhidden');
                    }
                    else {
                        $('#view-result-container').html(processTemplate(viewResultTemplate,getDataResult[0]));
                        resizeDynamicContainers($('#view-result-container'));
                        searchResultsParent.addClass('visuallyhidden');
                        $('#view-result-container').removeClass('visuallyhidden');
                        latLong.push(getDataResult[0].Latitude);
                        latLong.push(getDataResult[0].Longitude);
                    }
                    triggerAddDataToMap(latLong,getDataResult);

                    pageSpecFunc();
                    $('#no-results').remove(); //removes if no results template is appended
                    $('.resultset-title').removeClass('visuallyhidden');
                    searchResultsParent.find('.info').removeClass('visuallyhidden').addClass('status');

                    $('html, body').animate({
                        scrollTop: 0
                    }, 100);
                }
                else {
                    noResults();
                    pageSpecFunc();
                }
            }
        });
    };

    //Fill the search form with URL parameter
    fillFormWithUrlParams = function () {
        $.each(searchState,function (key,val) {
            var input = searchForm.find('input[name=\''+key+'\']').length>0 ? searchForm.find('input[name=\''+key+'\']') : searchForm.find('select[name=\''+key+'\']'),
            inputType;
            if(input.length>0) {
                inputType = input.attr('type') || input.prop('nodeName').toLowerCase();
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
            }
        });
    };

    //Logic that will process template to display results
    processTemplate = function(template,data){
        var eleHtml='';
        var ele = document.createElement('div');
        ele.innerHTML = template;
        $(ele).each(function(){
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
                        return swe.template.process( key, data );
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

    //Logic to pajinate results
    paginateResults = function () {
        searchResultsParent.pajinate({
            item_container_id: '#search-results',
            nav_panel_id: '.pagination',
            items_per_page: 10,
            num_page_links_to_display: 5,
            show_first_last: !1,
            slideTransition: !0,
            nav_label_prev: 'Previous',
            nav_label_next: 'Next'
        });
        searchResultsParent.find('.page_link').on('click',function(){	//written to continue numbering of ordered list
            var pageStart = $(this).attr('longdesc')*10;
            searchResultsParent.css('counter-reset','item '+pageStart);
        });
        searchResultsParent.find('.next_link, .previous_link').on('click',function(){  //written to continue numbering of ordered list
            var pageStart = searchResultsParent.find('.active_page').attr('longdesc')*10;
            searchResultsParent.css('counter-reset','item '+pageStart);
        });
        editSearchHeader();
    };

    //edit search header
    editSearchHeader = function () {
        var headerHtml='';
        switch (dataset) {
            case 'scd' : {
                    var s='', sectors = searchState.Sectors;

                    headerHtml = (typeof searchState.query !== 'undefined' && searchState.query.length>0) ? ' for <em><strong>\''+searchState.query+'\'</strong></em>' : '';
                    if(typeof sectors !== 'undefined' ) {
                        if(typeof sectors !== 'object'){sectors = [sectors];}
                        headerHtml += ' in ';
                        $.each(sectors,function(i,v){s +=' \''+v+'\',';});
                        headerHtml += '<em><strong>'+s.slice(0,-1)+'</strong></em>';
                    }
                    break;
                }
            default : {
                    headerHtml = (typeof searchState.location !== 'undefined' && searchState.location.length>0) ? ' near <em><strong>\''+searchState.location+'\'</strong></em>' : '';
                    break;
                }
        }
        $('.resultset-title').append(headerHtml);
    };

    //prepares data and triggers to load onto map
    triggerAddDataToMap = function(latLong,match){
        if(getDataResult !== {}) {
            if(!flag){ //flag to avoid reload of Map tiles
                jsonData = {
                    location: latLong,
                    matches: match
                };
                if (mapReady) {
                    addDataToMap();
                }
                // dataReady = true;
                flag = !flag;
            }
        }
        else {
            noResults();
        }
    };

    noResults = function(){
        var template;

        switch (dataset) {
            case 'community-recovery-centres': {
                    template = '<div class="status info" id="no-results"><h2>Please phone the Community Recovery Hotline</h2><p>There is no Community Recovery Centre within 50km of your location. Please phone the Community Recovery Hotline on <strong>1800 173 349</strong> for information about assistance.<p><p><a href="/community/disasters-emergencies/community-recovery-centres/">View all Community Recovery Centres</a> currently operating in Queensland.</p></div>';
                    break;
                }
            default: {
                    template = '<div class="status info" id="no-results"><h2>No results.</h2></div>';
                    break;
                }
        }
        searchResultsContainer.html('');
        searchResultsParent.find('.info').addClass('visuallyhidden').removeClass('status');
        searchResultsParent.append(template);
        searchResultsParent.removeClass('visuallyhidden');
        $('.resultset-title').addClass('visuallyhidden');
        $('#view-result-container').addClass('visuallyhidden');
        $('.pagination').html('');
        markerClusterer.clearMarkers(); //clearing existing markers
    };

    //Adjusts the height of dynamically created containers
    resizeDynamicContainers = function (container) {
        setTimeout(function(){
            container.trigger( 'x-height-change' );
        }, 200);
    };

    //Clears search form
    clearForm = function () {
        searchForm.find('input').not(':hidden, :submit').not('input[type=\'checkbox\']').not('input[type=\'radio\']').not('input[type=\'button\']').add('select').val('');
        searchForm.find('input[type=checkbox],input[type=radio]').prop('checked', false);
    };

    //gets query string from form to pass it to history
    getSearchStateFromForm = function () {
        var searchState = {},
            fields = $( 'input,select', searchForm ).not( '[type="image"],[type="button"],[type="submit"]' ).not('[type="checkbox"]:not(:checked)').not('[type="radio"]:not(:checked)');

        // read search input
        fields.each(function() {
            searchState[ this.name ] = ( this.name === 'location' ) ? encodeURIComponent($( this ).val()) : ( 'checkbox' === this.type || 'radio' === this.type ? (searchState[ this.name ] !== undefined ? searchState[ this.name ] + '~' + $(this).val() : $(this).val()) : $( this ).val());
        });

        return searchState;
    };

    //page specific functionalities will be written here
    pageSpecFunc = function () {
        if(typeof qg.swe.customMapScript !== undefined && typeof qg.swe.customMapScript === 'function') {
            qg.swe.customMapScript();
        }
    };

    //process and display search results template
    displaySearchResults = function(){
        // loop through items for HTML results
        resultsHTML = ''; //clear any previous html
        $.each( getDataResult, function( i, item ) {
            resultsHTML += processTemplate(displayTemplateHtml, item);
        });
        searchResultsContainer.html(resultsHTML);
        searchResultsContainer.removeClass('visuallyhidden');
        paginateResults();
        searchResultsParent.show();
    };

    // history state management
    History.Adapter.bind( window, 'statechange', function() {
        // var state = History.getState();
        // console.log(state);
        loadData();
    });

}(jQuery, qg.swe, History));


initMaps();
