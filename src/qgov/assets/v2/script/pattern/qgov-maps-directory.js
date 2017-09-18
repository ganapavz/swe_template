/* globals jQuery, L, qg, History, Placeholders, fullScreenApi */
/* jshint expr:true */

if (!String.prototype.contains) {
    String.prototype.contains = function (arg) {
        'use strict';
        return !!~this.indexOf(arg);
    };
}

(function( $, swe, History ) {
    'use strict';

    var
    // polyfill used?
        placeholdersPolyfill = typeof Placeholders !== 'undefined',
    // jQuery objects
        $search = $('.search-widget'),
        $form = $search.find('form'),
        $toggle = $search.find('#form-toggle'),

    // BAM (big awesome map), or MAM (medium awesome map), or SAM (small awesome map)
        BAM = $( 'body' ).hasClass( 'large-application' ),

    // config
        protocol = (!(/^https?:/).test( window.location.protocol )) ? 'http:' : window.location.protocol,
        baseTitle = document.title,
        baseURL = window.location.href.replace( /[#?].*$/, '' ),
        loadURL = protocol + '//www.qld.gov.au',
    // read resource ID and data environment from #dataset URL
        resourceId, // '8b9178e0-2995-42ad-8e55-37c15b4435a3',
        orderBy,
        dataEnvironment,

    // DOM objects
        $searchForm = $( '#app-viewport-tools-search' ),
        $searchLocation = $( '#location' ),
        $viewportInfo = $( '#app-viewport-info' ),
        $viewportResults = $( '#app-viewport-tools-results' ),
        $viewportTools = $( '#app-viewport-tools' ),
        $geocoding = $( '#app-geocoding' ),

    // templates
        infoTemplate = $viewportInfo.html(),
        searchResultTemplate = $( '<ol/>' ).append( $( 'li', '#app-viewport-tools-results' ).eq( 0 ) ).html(),
        dataContainer = $( '#app-viewport-data' ).parent().find( '.data-container' ).removeClass( 'data-container' ),
        dataTemplate = dataContainer.html() || '',
    // <h3><a href="?title={{idField}}">{{titleField}}</a></h3>
        idField = searchResultTemplate.replace( /^[\s\S]*?\{\{(.*?)\}\}[\s\S]*$/m, '$1' ),
        titleField = searchResultTemplate.replace( /^[\s\S]*?\{\{.*?\}\}.*?\{\{(.*?)\}\}[\s\S]*$/m, '$1' ),
        sqlSelect = '*',

    // map config
        MAX_ZOOM = $( '#app-viewport' ).hasClass( 'obscure' ) ? 12 : 17,
        ZOOM = 5,
        CENTER,
        QUEENSLAND,
        circle,

    // objects
        jsonData,
        jsonDataGeocode,
        itemsById = {},
        map,
        mapLayers = {},
        markerCluster,

    // location objects
        locLatLng,

    // functions
        initMaps,
        mapReset,
        setResults,
        getReverseGeocode,
        getLocationGeocode,
        getSearchState,
        getData,
        getOpenData,
        addDataToMap,
        showInfo,
        toggleView,

    // TODO legend config
    // icons from font awesome: http://fortawesome.github.io/Font-Awesome/icons/
        sectorIcons = {
            'Biotechnology': 'flask',
            'Construction': 'wrench',
            'Food and agriculture': 'cutlery',
            'Health and medical': 'medkit',
            'ICT and multimedia': 'laptop',
            'Manufacturing and design': 'cogs',
            'Mining/resources and energy': 'bolt',
            'Environment and nature': 'leaf',
            'Defence, aviation and space': 'fighter-jet',
            'Tourism': 'suitcase',
            'Commercialisation': 'dollar',
            'Research hospitals': 'h-square',
            'Social sciences': 'group',
            'Tropical': 'sun-o'
        }
        ;


    (function( datasetUrl ) {
        if ( datasetUrl.contains('?') ) {
            var array = datasetUrl.split('?');
            // read resource ID from #dataset URL
            resourceId = array[0].replace( /^.*\//, '' );
            // get the orderby parameter
            orderBy = array[1].replace( /^.*=/, '' );
        } else {
            // read resource ID from #dataset URL
            resourceId = datasetUrl.replace( /^.*\//, '' );
        }
        // staging only supported in non-production environments
        dataEnvironment = swe.isProduction || datasetUrl.indexOf( 'staging.data.qld.gov.au' ) === -1 ? 'data.qld.gov.au' : 'staging.data.qld.gov.au';
    }( $( 'a', '#dataset' ).attr( 'href' ) ));


    if ( BAM ) {
        // BAM: do nothing
        toggleView = $.noop;
    } else {
        // SAM: toggle between search and details view
        toggleView = function( showDetailsView ) {
            $form.addClass('hide');
            $toggle.removeClass('up');
            $viewportResults.removeClass( 'visuallyhidden' ).toggle( !showDetailsView );
            $( '#view' ).removeClass( 'visuallyhidden' ).toggle( showDetailsView );
            $( '#article' ).trigger( 'x-height-change' );
            // scroll to top if map not completely visibile
            if ( $( document ).scrollTop() > $( '#map_canvas' ).offset().top ) {
                $( document ).scrollTop( 0 );
            }
        };
    }


    // hide the dataset link
    $( '#dataset' ).hide();
    // remove info template
    $viewportInfo.empty();


    // initialise map
    initMaps = function() {
        L.Icon.Default.imagePath = qg.swe.paths.assets + 'images/skin/map-marker';
        CENTER = [ -23, 143 ];

        var mapResize = function() {
            var viewport = $( '#large-application, #map_canvas' ),
                viewportTop, viewportMargin
                ;
            if ( BAM ) {
                viewportTop = viewport.offset().top;
                viewportMargin = viewportTop - $( '#content-container' ).offset().top;
                viewport.height( $( window ).height() - ( viewportTop + viewportMargin ));
            } else {
                viewport.height( 270 );
            }
        };

        var toggleLink = function() {
            if ($search.length) {
                $search.find('.widget-header').append($('<span class="action"><a href="#" id="form-toggle" class="up">Toggle</a></span>'));
                $toggle = $search.find('#form-toggle');
                $toggle.bind('click', function (e) {
                    e.preventDefault();
                    $form.is(':visible') ? $form.addClass('hide') : $form.removeClass('hide');
                    $form.is(':visible') ? $(this).addClass('up') : $(this).removeClass('up');
                });
            }
        };

        // fix height of viewport
        $( '#app-viewport' ).prepend( '<div id="map_canvas"></div>' );
        // setup map
        mapResize();
        // setup toggle
        toggleLink();

        // leaflet map
        map = L.map( 'map_canvas', {
            center: CENTER,
            zoom: ZOOM,
            maxZoom: MAX_ZOOM,
            fullscreenControl: true,
            fullscreenControlOptions: { // optional
                title:'Fullscreen'
            }
        });

        // street map
        mapLayers[ 'Street map' ] = L.tileLayer( '//server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2013'
        });

        // satellite layer option
        mapLayers.Satellite = L.layerGroup([
            L.tileLayer( '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Esri, DigitalGlobe, GeoEye, i-cubed, USDA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community'
            }),
            L.tileLayer( '//server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
                attribution: '© 2013 Esri, DeLorme, NAVTEQ, TomTom'
            }),
            L.tileLayer( '//server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
                attribution: '© 2013 Esri, DeLorme, NAVTEQ, TomTom'
            })
        ]);
        // default base layer
        mapLayers[ 'Street map' ].addTo( map );
        // layers control for street/satellite switch
        L.control.layers( mapLayers, {}, { position: 'topright' }).addTo( map );

        markerCluster = new L.MarkerClusterGroup({
            iconCreateFunction: function( cluster ) {
                return L.divIcon({
                    iconAnchor: [ 10, 25 ],
                    html: '<img src="' + L.Icon.Default.imagePath + '/cluster-marker-icon.png" alt="" />' + '<span class="count">' + cluster.getChildCount() + '</span>',
                    className: 'cluster-icon'
                });
            }
        });

        // create highlight circle (do not add to map)
        circle = L.circle( CENTER, 100, {
            color: '#f00',
            opacity: 0.8,
            weight: 3,
            fill: false,
            clickable: false
        });

        // create statewide highlight (do not add to map)
        // http://www.ga.gov.au/education/geoscience-basics/dimensions/state-territory-borders.html
        QUEENSLAND = L.polygon([
            [ -29, 148.95676 ],
            [ -28.9661, 149.0007 ],
            [ -28.95769, 149.01306 ],
            [ -28.95168, 149.03641 ],
            [ -28.91322, 149.05289 ],
            [ -28.86632, 149.07211 ],
            [ -28.83625, 149.08928 ],
            [ -28.83182, 149.13045 ],
            [ -28.81107, 149.14013 ],
            [ -28.80978, 149.16 ],
            [ -28.80016, 149.18472 ],
            [ -28.77521, 149.19249 ],
            [ -28.75841, 149.22785 ],
            [ -28.73756, 149.25201 ],
            [ -28.73515, 149.27673 ],
            [ -28.70755, 149.29999 ],
            [ -28.70504, 149.33167 ],
            [ -28.68818, 149.35913 ],
            [ -28.6953, 149.39161 ],
            [ -28.65945, 149.41531 ],
            [ -28.61225, 149.44427 ],
            [ -28.59417, 149.46625 ],
            [ -28.58211, 149.50058 ],
            [ -28.57729, 149.54453 ],
            [ -28.57608, 149.58984 ],
            [ -28.59899, 149.61319 ],
            [ -28.59899, 149.63791 ],
            [ -28.61225, 149.65027 ],
            [ -28.6219, 149.66675 ],
            [ -28.63275, 149.67773 ],
            [ -28.63154, 149.70657 ],
            [ -28.61254, 149.71604 ],
            [ -28.61708, 149.74365 ],
            [ -28.61225, 149.78897 ],
            [ -28.60864, 149.8288 ],
            [ -28.60743, 149.86313 ],
            [ -28.60743, 149.87137 ],
            [ -28.61949, 149.89883 ],
            [ -28.61105, 149.91531 ],
            [ -28.60988, 149.97504 ],
            [ -28.57818, 150.02512 ],
            [ -28.58404, 150.04413 ],
            [ -28.5797, 150.06912 ],
            [ -28.56402, 150.13641 ],
            [ -28.55558, 150.17487 ],
            [ -28.57126, 150.20233 ],
            [ -28.57005, 150.21881 ],
            [ -28.54763, 150.25374 ],
            [ -28.5411, 150.28748 ],
            [ -28.5411, 150.30121 ],
            [ -28.55316, 150.32455 ],
            [ -28.57005, 150.33005 ],
            [ -28.59417, 150.36438 ],
            [ -28.61949, 150.36713 ],
            [ -28.63034, 150.39459 ],
            [ -28.63636, 150.41382 ],
            [ -28.65324, 150.41794 ],
            [ -28.66649, 150.46463 ],
            [ -28.66047, 150.51132 ],
            [ -28.65685, 150.53055 ],
            [ -28.67131, 150.53055 ],
            [ -28.67372, 150.55115 ],
            [ -28.65713, 150.55587 ],
            [ -28.65806, 150.57999 ],
            [ -28.6689, 150.60196 ],
            [ -28.67372, 150.62668 ],
            [ -28.65444, 150.67612 ],
            [ -28.66408, 150.68436 ],
            [ -28.63757, 150.73105 ],
            [ -28.63757, 150.75027 ],
            [ -28.66288, 150.82855 ],
            [ -28.69179, 150.86838 ],
            [ -28.693, 150.89447 ],
            [ -28.70504, 150.92743 ],
            [ -28.73395, 150.94116 ],
            [ -28.73756, 150.98785 ],
            [ -28.74481, 151.00886 ],
            [ -28.76003, 151.02802 ],
            [ -28.77609, 151.02356 ],
            [ -28.79294, 151.02493 ],
            [ -28.80136, 151.03867 ],
            [ -28.82783, 151.04141 ],
            [ -28.84708, 151.05103 ],
            [ -28.84106, 151.09085 ],
            [ -28.86392, 151.1499 ],
            [ -28.88075, 151.18561 ],
            [ -28.92043, 151.24191 ],
            [ -28.95069, 151.28143 ],
            [ -28.98171, 151.27899 ],
            [ -29.03153, 151.27628 ],
            [ -29.05737, 151.28311 ],
            [ -29.07297, 151.27487 ],
            [ -29.11617, 151.29684 ],
            [ -29.13777, 151.3092 ],
            [ -29.16415, 151.31607 ],
            [ -29.17615, 151.3559 ],
            [ -29.17495, 151.39847 ],
            [ -29.14448, 151.42933 ],
            [ -29.10543, 151.46708 ],
            [ -29.06827, 151.49863 ],
            [ -29.02435, 151.49872 ],
            [ -28.98772, 151.5303 ],
            [ -28.94086, 151.55777 ],
            [ -28.93966, 151.57837 ],
            [ -28.92404, 151.60721 ],
            [ -28.87594, 151.71982 ],
            [ -28.87113, 151.7308 ],
            [ -28.92043, 151.74866 ],
            [ -28.93781, 151.77778 ],
            [ -28.95648, 151.77475 ],
            [ -28.95168, 151.80222 ],
            [ -28.96369, 151.8187 ],
            [ -28.95528, 151.84341 ],
            [ -28.92884, 151.84067 ],
            [ -28.9036, 151.85165 ],
            [ -28.91442, 151.87912 ],
            [ -28.92043, 151.90933 ],
            [ -28.93245, 151.9313 ],
            [ -28.91201, 151.98212 ],
            [ -28.89611, 151.99665 ],
            [ -28.90961, 152.00958 ],
            [ -28.87955, 152.02881 ],
            [ -28.84863, 152.04103 ],
            [ -28.84534, 152.02101 ],
            [ -28.83036, 152.03283 ],
            [ -28.79414, 152.03842 ],
            [ -28.73934, 152.04114 ],
            [ -28.7232, 152.05482 ],
            [ -28.7027, 152.07407 ],
            [ -28.67854, 152.06177 ],
            [ -28.66288, 152.04254 ],
            [ -28.66053, 152.01307 ],
            [ -28.59971, 151.99199 ],
            [ -28.57397, 151.97951 ],
            [ -28.55913, 151.96154 ],
            [ -28.51883, 151.95495 ],
            [ -28.50611, 151.9725 ],
            [ -28.51576, 151.98349 ],
            [ -28.52662, 152.00546 ],
            [ -28.49461, 152.04324 ],
            [ -28.48197, 152.07138 ],
            [ -28.46813, 152.07007 ],
            [ -28.47111, 152.08923 ],
            [ -28.46145, 152.13181 ],
            [ -28.43748, 152.14816 ],
            [ -28.43247, 152.19635 ],
            [ -28.44817, 152.21832 ],
            [ -28.42897, 152.23333 ],
            [ -28.4059, 152.25677 ],
            [ -28.39502, 152.27188 ],
            [ -28.3914, 152.28836 ],
            [ -28.36541, 152.31924 ],
            [ -28.36965, 152.33643 ],
            [ -28.36162, 152.36495 ],
            [ -28.36844, 152.39273 ],
            [ -28.31889, 152.41333 ],
            [ -28.2989, 152.41467 ],
            [ -28.29713, 152.4408 ],
            [ -28.27299, 152.46409 ],
            [ -28.25277, 152.47088 ],
            [ -28.2548, 152.51358 ],
            [ -28.26568, 152.53555 ],
            [ -28.3068, 152.52319 ],
            [ -28.32614, 152.56302 ],
            [ -28.33102, 152.57633 ],
            [ -28.30923, 152.60008 ],
            [ -28.28569, 152.59743 ],
            [ -28.27052, 152.60834 ],
            [ -28.30922, 152.63306 ],
            [ -28.31526, 152.67014 ],
            [ -28.33219, 152.67975 ],
            [ -28.35165, 152.73504 ],
            [ -28.36361, 152.75116 ],
            [ -28.35153, 152.76901 ],
            [ -28.35032, 152.78961 ],
            [ -28.35515, 152.80609 ],
            [ -28.34065, 152.81433 ],
            [ -28.31405, 152.85416 ],
            [ -28.31461, 152.8809 ],
            [ -28.33605, 152.94209 ],
            [ -28.34056, 153.05264 ],
            [ -28.35878, 153.10684 ],
            [ -28.29675, 153.16241 ],
            [ -28.26723, 153.17399 ],
            [ -28.24948, 153.18336 ],
            [ -28.25117, 153.19336 ],
            [ -28.26084, 153.20435 ],
            [ -28.26084, 153.23318 ],
            [ -28.23786, 153.2785 ],
            [ -28.23786, 153.33481 ],
            [ -28.25238, 153.34167 ],
            [ -28.24512, 153.38013 ],
            [ -28.21003, 153.40759 ],
            [ -28.18703, 153.44055 ],
            [ -28.17372, 153.4639 ],
            [ -28.1642, 153.46795 ],
            [ -28.15737, 153.48793 ],
            [ -28.17251, 153.52295 ],
            [ -28.17614, 153.53668 ],
            [ -28.16166, 153.549 ],
            [ -28.11333, 153.56433 ],
            [ -27.97965, 153.51012 ],
            [ -27.73809, 153.5393 ],
            [ -27.38727, 153.63807 ],
            [ -27.31197, 153.55181 ],
            [ -26.97349, 153.63831 ],
            [ -26.90118, 153.45175 ],
            [ -26.91218, 153.26327 ],
            [ -26.69284, 153.26749 ],
            [ -26.51624, 153.22665 ],
            [ -26.31679, 153.23175 ],
            [ -26.08245, 153.27557 ],
            [ -25.90123, 153.31146 ],
            [ -25.79975, 153.24971 ],
            [ -25.75894, 153.19486 ],
            [ -25.67525, 153.18163 ],
            [ -25.34467, 153.32766 ],
            [ -25.06132, 153.46224 ],
            [ -24.92749, 153.46797 ],
            [ -24.84158, 153.42682 ],
            [ -24.64095, 153.38864 ],
            [ -24.57804, 153.2801 ],
            [ -24.73672, 153.05348 ],
            [ -24.73935, 152.53555 ],
            [ -24.63628, 152.45515 ],
            [ -24.61706, 152.32819 ],
            [ -24.46594, 152.15118 ],
            [ -24.24597, 152.06511 ],
            [ -23.93244, 151.81023 ],
            [ -23.83605, 151.48939 ],
            [ -23.51766, 151.33193 ],
            [ -23.36259, 151.19673 ],
            [ -23.39002, 150.96431 ],
            [ -23.25484, 151.00134 ],
            [ -22.83832, 150.96052 ],
            [ -22.56689, 150.91387 ],
            [ -22.27536, 150.8208 ],
            [ -22.08055, 150.49896 ],
            [ -22.12357, 150.3296 ],
            [ -22.21024, 150.22711 ],
            [ -22.06273, 150.18036 ],
            [ -21.97642, 149.98867 ],
            [ -21.96359, 149.87151 ],
            [ -22.00583, 149.74621 ],
            [ -22.15434, 149.70795 ],
            [ -21.92165, 149.62065 ],
            [ -21.74826, 149.5656 ],
            [ -21.52718, 149.60083 ],
            [ -21.37892, 149.55963 ],
            [ -21.28284, 149.43478 ],
            [ -21.09884, 149.37883 ],
            [ -20.91425, 149.30209 ],
            [ -20.81261, 149.15863 ],
            [ -20.71074, 148.968 ],
            [ -20.67969, 148.89112 ],
            [ -20.63021, 148.85925 ],
            [ -20.45275, 149.20532 ],
            [ -20.27354, 149.23809 ],
            [ -20.14878, 149.17786 ],
            [ -19.96968, 149.04708 ],
            [ -19.90906, 148.85731 ],
            [ -20.01465, 148.76312 ],
            [ -20.04535, 148.69504 ],
            [ -19.89217, 148.57202 ],
            [ -19.77393, 148.36026 ],
            [ -19.88556, 148.27423 ],
            [ -19.76756, 148.09275 ],
            [ -19.75099, 147.99752 ],
            [ -19.58719, 147.89069 ],
            [ -19.56755, 147.74689 ],
            [ -19.62189, 147.7002 ],
            [ -19.46812, 147.6594 ],
            [ -19.28414, 147.53916 ],
            [ -19.16197, 147.39402 ],
            [ -19.21262, 147.29095 ],
            [ -19.30596, 147.26624 ],
            [ -19.278, 147.18274 ],
            [ -19.10461, 147.14287 ],
            [ -19.04914, 146.99158 ],
            [ -19.02613, 146.88882 ],
            [ -19.005, 146.69495 ],
            [ -18.96644, 146.54001 ],
            [ -18.85976, 146.6206 ],
            [ -18.80232, 146.84875 ],
            [ -18.65822, 146.78898 ],
            [ -18.58117, 146.69495 ],
            [ -18.53236, 146.57301 ],
            [ -18.3102, 146.4093 ],
            [ -18.19283, 146.42578 ],
            [ -18.04449, 146.3409 ],
            [ -17.96442, 146.26504 ],
            [ -17.84174, 146.23389 ],
            [ -17.73561, 146.25275 ],
            [ -17.60476, 146.2912 ],
            [ -17.49897, 146.2479 ],
            [ -17.32062, 146.22546 ],
            [ -17.11454, 146.10718 ],
            [ -16.95172, 146.04675 ],
            [ -16.76773, 146.05774 ],
            [ -16.71775, 145.90118 ],
            [ -16.72295, 145.78452 ],
            [ -16.56915, 145.64429 ],
            [ -16.42713, 145.57238 ],
            [ -16.35704, 145.54413 ],
            [ -16.22455, 145.64427 ],
            [ -16.06827, 145.64028 ],
            [ -15.90482, 145.57499 ],
            [ -15.77, 145.482 ],
            [ -15.58865, 145.44525 ],
            [ -15.39438, 145.3717 ],
            [ -15.26078, 145.44774 ],
            [ -15.10017, 145.41535 ],
            [ -14.94797, 145.49442 ],
            [ -14.84127, 145.41779 ],
            [ -14.73657, 145.34469 ],
            [ -14.71403, 145.24572 ],
            [ -14.65534, 145.12939 ],
            [ -14.57428, 145.04562 ],
            [ -14.44958, 144.99276 ],
            [ -14.43218, 144.83976 ],
            [ -14.36551, 144.78058 ],
            [ -14.11616, 144.70101 ],
            [ -14.0337, 144.57343 ],
            [ -14.00105, 144.43062 ],
            [ -14.08597, 144.38782 ],
            [ -14.14173, 144.30842 ],
            [ -14.1525, 144.12545 ],
            [ -14.26971, 144.09393 ],
            [ -14.30697, 143.9209 ],
            [ -14.11793, 143.7973 ],
            [ -13.84824, 143.68938 ],
            [ -13.41774, 143.66828 ],
            [ -12.77295, 143.65999 ],
            [ -12.71872, 143.52979 ],
            [ -12.56219, 143.5742 ],
            [ -12.45122, 143.44172 ],
            [ -12.27983, 143.40761 ],
            [ -12.2246, 143.2782 ],
            [ -12.09197, 143.32704 ],
            [ -11.96487, 143.37405 ],
            [ -11.79488, 143.22611 ],
            [ -11.7601, 143.03258 ],
            [ -11.69265, 142.97307 ],
            [ -11.50818, 142.98697 ],
            [ -11.33554, 143.03624 ],
            [ -11.15954, 142.97058 ],
            [ -10.98434, 142.94037 ],
            [ -10.83951, 142.8912 ],
            [ -10.74036, 142.81247 ],
            [ -10.59203, 142.76508 ],
            [ -10.53158, 142.58222 ],
            [ -10.54437, 142.43123 ],
            [ -10.37598, 142.34246 ],
            [ -10.17437, 142.48169 ],
            [ -9.96777, 142.41084 ],
            [ -9.9339, 142.16463 ],
            [ -10.01456, 142.00433 ],
            [ -10.26898, 141.97083 ],
            [ -10.4392, 142.01477 ],
            [ -10.66331, 142.01752 ],
            [ -10.85758, 141.94336 ],
            [ -11.06161, 142.00078 ],
            [ -11.32656, 142.0285 ],
            [ -11.59305, 141.94336 ],
            [ -11.88885, 141.79504 ],
            [ -12.15819, 141.62235 ],
            [ -12.48753, 141.49567 ],
            [ -12.65761, 141.47389 ],
            [ -12.85733, 141.52039 ],
            [ -13.0447, 141.50116 ],
            [ -13.2346, 141.53961 ],
            [ -13.40298, 141.50391 ],
            [ -13.5659, 141.41327 ],
            [ -13.79807, 141.36108 ],
            [ -13.97405, 141.35284 ],
            [ -14.21114, 141.44348 ],
            [ -14.4267, 141.41602 ],
            [ -14.66863, 141.43524 ],
            [ -14.88905, 141.48193 ],
            [ -15.09069, 141.56708 ],
            [ -15.27889, 141.47095 ],
            [ -15.48545, 141.35284 ],
            [ -15.72088, 141.31165 ],
            [ -15.87945, 141.28693 ],
            [ -16.04581, 141.30341 ],
            [ -16.18566, 141.26495 ],
            [ -16.4936, 141.17057 ],
            [ -16.68168, 141.04724 ],
            [ -16.84661, 140.91888 ],
            [ -17.00689, 140.85846 ],
            [ -17.18016, 140.83099 ],
            [ -17.37423, 140.76782 ],
            [ -17.43165, 140.66116 ],
            [ -17.49977, 140.53754 ],
            [ -17.57307, 140.36198 ],
            [ -17.60461, 140.11256 ],
            [ -17.52185, 139.95921 ],
            [ -17.3959, 139.66535 ],
            [ -17.29978, 139.6205 ],
            [ -17.1488, 139.75147 ],
            [ -16.97011, 139.68842 ],
            [ -16.88866, 139.50165 ],
            [ -16.82697, 139.44525 ],
            [ -16.74143, 139.61151 ],
            [ -16.64155, 139.70206 ],
            [ -16.58618, 139.86694 ],
            [ -16.41396, 139.94042 ],
            [ -16.34243, 139.85194 ],
            [ -16.24676, 139.50603 ],
            [ -16.31403, 139.3742 ],
            [ -16.40947, 139.15346 ],
            [ -16.55723, 139.04572 ],
            [ -16.70986, 139.00177 ],
            [ -16.76773, 138.9743 ],
            [ -16.70986, 138.80676 ],
            [ -16.67075, 138.62709 ],
            [ -16.68092, 138.52386 ],
            [ -16.6283, 138.37555 ],
            [ -16.5998, 138.24039 ],
            [ -16.52664, 138.12719 ],
            [ -16.44233, 138 ],
            [ -26, 138 ], // Poeppel Corner
            [ -26, 141 ], // Haddon Corner
            [ -29, 141 ]  // Cameron Corner
        ], {
            color: '#f00',
            opacity: 0.8,
            weight: 3,
            fill: false,
            lineJoin: 'round',
            clickable: false
        });

        // handle resizing
        window.ResizeEvents.bind( 'x-window-width-resize', mapResize );

        // Replacing default values for button accessibility
        $( '.leaflet-control-zoom-fullscreen' ).html( 'Fullscreen' );
        $( '.leaflet-control-zoom-out' ).html( 'Zoom out' );
        $( '.leaflet-control-zoom-in' ).html( 'Zoom in' );

        // Let's make leaflet map js more accessible :) - putting "for" on labels for input buttons within the layers selection area.

        $( '.leaflet-control-layers-base label' ).each(function() {
            //for each span within leaflet layer label wrapper find span content and strip spaces
            var spanText = $.trim( $( 'span', this ).text().replace( /\s+/g, '' ));
            // check if this name is an id already with $(~~~).generateId(spanText);
            //set label for attribute and input id
            var input = $( 'input', this ).generateId( spanText );
            $( this ).attr( 'for', input.attr( 'id' ));

        });
    };

    initMaps();

    // get the data fields we need
    sqlSelect = {};
    $.each(( infoTemplate + searchResultTemplate + dataTemplate ).match( /\{\{.*?\}\}/g ), function( i, value ) {
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


    // get search state, for history
    getSearchState = function() {
        var searchState = {},
            fields = $( 'input,select', '#app-viewport-tools-search' ).not( '[type="image"],[type="button"]' ),
            placeholders = $()
            ;
        //console.log( 'getSearchState', fields );

        // disable placeholder polyfill
        if ( placeholdersPolyfill ) {
            placeholders = fields.filter( '[placeholder]' );
            placeholders.each(function() { Placeholders.disable( this ); });
        }

        // read search input
        fields.each(function() {
            searchState[ this.name ] = ( this.name === 'location' ) ? $( this ).val().replace( / /g, '+' ) : $( this ).val();
        });
        //console.log( searchState );

        // enable placeholder polyfill
        if ( placeholders.length > 0 ) {
            setTimeout(function() {
                placeholders.each(function() { Placeholders.enable( this ); });
            }, 0 );
        }

        return searchState;
    };

    // add data to the map
    addDataToMap = function( config ) {
        //console.log( 'addDataToMap start', config );
        var resultsHTML = '',
            dataHTML = '',
            results = $viewportResults,
            dataset = jsonData,
            markers = [],
            total = dataset.result.records.length
            ;

        // refreshing data?
        if ( config.refresh !== false ) {

            // clear markers
            itemsById = {};

            // clear old data
            markerCluster.clearLayers();
            map.removeLayer( markerCluster );
            dataContainer.empty();

            // update search context
            $( '.resultset-title span' ).remove();
            // update counter
            $( '.resultset-title strong', results ).each(function() {
                var t = $( this );
                t.text( t.text().replace( /\d+$/, total ));
            });

            // loop through items for map
            $.each( dataset.result.records, function( i, item ) {
                var marker, markerOptions;

                // track it
                itemsById[ item[ idField ]] = item;

                // check lat and long
                if ( isNaN( parseFloat( item.Latitude )) || isNaN( parseFloat( item.Longitude ))) {
                    // $.debug( 'Invalid Latitude/Longitude: ', item );
                    // item.Latitude = -22.550356;
                    // item.Longitude = 144.196936;
                    item.Statewide = true;
                    return;
                }

                // marker options
                markerOptions = { title: item[ titleField ] };

                // TODO configure marker labels (template)
                if ( typeof item.Sector === 'string' ) {
                    markerOptions.icon = L.divIcon({
                        className: 'filter-icon key',
                        iconAnchor: [ 20, 25 ],
                        html: '<img src="' + L.Icon.Default.imagePath + '/marker-icon.png" alt="" />' +
                            '<ul>' +
                            $.map( $.trim( item.Sector ).split( /[;\n]/ ), function( value ) {
                                value = $.trim( value );
                                if ( !! sectorIcons[ value ] ) {
                                    return '<li><i class="fa fa-' + sectorIcons[ value ] + '" title="' + swe.template.clean( value ) + '"></i></li>';
                                } else {
                                    return '<li>' + swe.template.clean( value ) + '</li>';
                                }
                            }).join( '' ) +
                            '</ul>'
                    });
                }

                // create a marker
                marker = new L.marker( [ item.Latitude, item.Longitude ], markerOptions );
                // marker.record = item;
                markers.push( marker );

                // track it
                itemsById[ item[ idField ]]._marker = marker;

                // marker click, show info-panel
                marker.on( 'click', function() {
                    var id = item[ idField ],
                        title = item[ titleField ]
                        ;
                    //console.log( 'marker click', item, { title: title, search: getSearchState });
                    History.pushState({ id: id, title: title, search: getSearchState(), refresh: false }, baseTitle.replace( /^[^\|]*/, title + ' ' ), '?title=' + id );
                    // Google Analytics for map interaction (1/3)
                    //_gaq.push(
                    //    [  qg.swe.GATracker +'._trackEvent', 'click', 'map', 'click: ' + title , 0, true ]
                    //);

                    // focus on pin
                    var latLong;
                    latLong = item._marker.getLatLng();
                    map.setView( latLong, MAX_ZOOM );

                    // Cancel fullscreen not working for Firefox without implicitly putting the following code
                    // Internet explorer not supported
                    fullScreenApi.cancelFullScreen();

                });
            });

            // add all markers
            markerCluster.addLayers( markers );
            map.addLayer( markerCluster );

            // loop through items for HTML results
            $.each( dataset.result.records, function( i, item ) {
                // append to search results
                resultsHTML += swe.template.process( searchResultTemplate, item );
                // append to data display (if relevant)
                dataHTML += swe.template.process( dataTemplate, item );
            });

            // remove loading placeholder
            $viewportResults.nextAll( '.loading' ).remove();

            // show results
            $( 'ol', results ).append( resultsHTML );
            results.pajinate({
                item_container_id: '.search-results',
                nav_panel_id: '.pagination',
                items_per_page: 10,
                num_page_links_to_display: 5,
                nav_label_prev: 'Previous',
                show_first_last: false,
                slideTransition : true
            });
            if ( config.search.location ) {
                $( '.resultset-title' ).append( '<span> near <strong>' + swe.template.clean( config.search.location.replace( /\+/g, ' ' ) ) + '</strong></span>' );
            }
            results.slideDown( 400, function () {
                setTimeout(function () {
                    $( '#article' ).trigger( 'x-height-change' );
                }, 500);
                $( '#article' ).trigger( 'x-height-change' );
            });
            // update table
            dataContainer.html( dataHTML );
        }

        // show all the results, or a specific one?
        if ( typeof config.id !== 'undefined' ) {
            //console.log( 'addDataToMap calling showInfo (id)', config.id, itemsById[ config.id ] );
            showInfo( itemsById[ config.id ] );
        } else if ( typeof config.title !== 'undefined' ) {
            //console.log( 'addDataToMap calling showInfo (title)', config.title, itemsById[ config.title ] );
            showInfo( itemsById[ config.title ] );
        } else {
            if ( config.search.location && jsonDataGeocode.coords ) {
                // show first n markers (note: markers are sorted by distance) or km radius (minimum)
                map.fitBounds( new L.featureGroup( markers.slice( 0, 2 )).addLayer( L.circle( jsonDataGeocode.coords, 7500 )).getBounds() );
            } else {
                map.fitBounds( new L.featureGroup( markers ).getBounds() );
            }
            $( '#article' ).trigger( 'x-height-change' );
        }

        //console.log( 'addDataToMap end' );
    };


    showInfo = function( item ) {
        var latLong;

        if ( item._marker ) {
            latLong = item._marker.getLatLng();

            //console.log( 'showInfo()', marker, latLong );

            circle.setLatLng( latLong );
            map.addLayer( circle );
            map.setView( latLong, MAX_ZOOM );
            //console.log( 'setView', latLong, MAX_ZOOM );

        } else if ( item.Statewide === true ) {
            map.addLayer( QUEENSLAND );
            map.fitBounds( QUEENSLAND.getBounds(), MAX_ZOOM );
            map.removeLayer( markerCluster );
        }

        // show the info
        $viewportInfo.html( swe.template.process( infoTemplate, item ));
        // GA external link tracking
        //$viewportInfo.find( 'a:external' ).trackEvent( 'click', 'external-link' );
        if ( BAM ) {
            swe.pageModel.refresh({ show: 'viewport-info' });
        } else {
            toggleView( true );
        }
    };

    // get location data
    getLocationGeocode = function( data ) {
        //console.log( 'getLocationGeocode', data );
        //console.log( 'loadURL', loadURL + '/assets/includes/dynamic/directory/json.beta.php' );
        $.ajax({
            type: 'GET',
            url: loadURL + '/assets/includes/dynamic/directory/json.php',
            contentType: 'application/json; charset=utf-8',
            data: {
                dataset: data,
                format: 'json',
                action: 'geocode'
            },
            crossDomain: true,
            dataType: 'jsonp',
            jsonp: 'callback',
            async: false,
            beforeSend: function () {
                // Handle the beforeSend event
                //xhook.disable();
            },
            complete: function () {
                // Handle the complete event
                //xhook.enable();
            }
        }).done(function ( jqXHR ) {
            //console.log( 'getLocationGeocode', jqXHR );
            if ( jqXHR) {
                getOpenData( data, jqXHR );
            }
        }).fail(function ( jqXHR, textStatus, errorThrown ) {
            //jqXHR, textStatus, errorThrown
            $.debug( 'Get session failed ' + jqXHR );
            $.debug( 'Get session textStatus ' + textStatus );
            $.debug( 'Get session errorThrown ' + errorThrown );
        });
    };

    // get reverse geocode data from location coords
    getReverseGeocode = function( data ) {
        //console.log( 'getReverseGeocode', data );
        //console.log( 'loadURL', loadURL );
        $.ajax({
            type: 'GET',
            url: loadURL + '/assets/includes/dynamic/directory/json.php',
            data: {
                dataset: data,
                format: 'json',
                action: 'lookup'
            },
            async: false,
            contentType: 'application/json; charset=utf-8',
            crossDomain: true,
            dataType: 'jsonp',
            jsonp: 'callback',
            beforeSend: function(){
                // Handle the beforeSend event
                //xhook.disable();
            },
            complete: function(){
                // Handle the complete event
                //xhook.enable();
            }
        }).done(function ( jqXHR ) {
            //console.log( 'getReverseGeocode', jqXHR );
            if ( jqXHR ) {
                var data = [];
                for( var item in jqXHR.matches) {
                    if( item.length > 0 ) {
                        if( typeof jqXHR.matches[item].formatted_address === 'string' ) {
                            data.push( jqXHR.matches[item].formatted_address );
                        }
                        $searchLocation.val( data[0] );
                    }
                }
            }
        }).fail(function ( jqXHR, textStatus, errorThrown ) {
            //jqXHR, textStatus, errorThrown
            $.debug( 'Get session failed ' + jqXHR );
            $.debug( 'Get session textStatus ' + textStatus );
            $.debug( 'Get session errorThrown ' + errorThrown );
        });
    };

    getOpenData = function( state, results ) {
        // extend state object
        state.search = state;
        jsonDataGeocode = results;
        //console.log( 'jsonDataGeocode', jsonDataGeocode );

        // load json open data
        var sql, sqlOrderBy = '';

        // if we have both values set, then we run a query on everything
        // if we have both values set, then we run a query on everything
        if( state.search.location.length && state.search.query.length ) {
            sql = 'SELECT "Latitude","Longitude",' + sqlSelect + ',' +
                '( 3959 * acos( cos( radians(' + jsonDataGeocode.coords.lat + ') ) * cos( radians("Latitude") ) * cos( radians("Longitude") - radians(' + jsonDataGeocode.coords.lng + ') ) + sin( radians(' + jsonDataGeocode.coords.lat + ') ) * sin( radians("Latitude") ) ) ) AS "Distance" ' +
                'from "' + resourceId + '" ' +
                (( state.search.query === '' ) ? '' : ', plainto_tsquery( \'english\', \'' + state.search.query + '\' ) query' ) + ' ' +
                'WHERE 1=1 ' +
                'AND ( 3959 * acos( cos( radians(' + jsonDataGeocode.coords.lat + ') ) * cos( radians("Latitude") ) * cos( radians("Longitude") - radians(' + jsonDataGeocode.coords.lng + ') ) + sin( radians(' + jsonDataGeocode.coords.lat + ') ) * sin( radians("Latitude") ) ) ) ' + decodeURIComponent( '%3C=' ) + ' ' + state.search.distance + ' ' +
                (( state.search.query === '' ) ? '' : 'AND _full_text @@ query' );
            sqlOrderBy = (typeof orderBy === 'undefined') ? 'ORDER BY "Distance" LIMIT 50' : 'ORDER BY "' + orderBy + '", "Distance" LIMIT 50';
        }
        // if we only have location value set, then we search by coords/distance
        else if( state.search.location.length ) {
            sql = 'SELECT "Latitude","Longitude",' + sqlSelect + ',' +
                '( 3959 * acos( cos( radians(' + jsonDataGeocode.coords.lat + ') ) * cos( radians("Latitude") ) * cos( radians("Longitude") - radians(' + jsonDataGeocode.coords.lng + ') ) + sin( radians(' + jsonDataGeocode.coords.lat + ') ) * sin( radians("Latitude") ) ) ) AS "Distance" ' +
                'from "' + resourceId + '" ' +
                'WHERE ( 3959 * acos( cos( radians(' + jsonDataGeocode.coords.lat + ') ) * cos( radians("Latitude") ) * cos( radians("Longitude") - radians(' + jsonDataGeocode.coords.lng + ') ) + sin( radians(' + jsonDataGeocode.coords.lat + ') ) * sin( radians("Latitude") ) ) ) ' + decodeURIComponent( '%3C=' ) + ' ' + state.search.distance;
            sqlOrderBy = (typeof orderBy === 'undefined') ? 'ORDER BY "Distance" LIMIT 50' : 'ORDER BY "' + orderBy + '", "Distance" LIMIT 50';
        }
        // if we have only the query string set, then we run this
        else {
            sql = 'SELECT "Latitude","Longitude",' + sqlSelect + ' ' +
                'from "' + resourceId + '"' +
                (( state.search.query === '' ) ? '' : ', plainto_tsquery( \'english\', \'' + state.search.query + '\' ) query' ) + ' ' +
                'WHERE 1 = 1 ' +
                (( state.search.query === '' ) ? '' : 'AND _full_text @@ query' );
            sqlOrderBy = (typeof orderBy === 'undefined') ? '' : 'ORDER BY "' + orderBy + '" LIMIT NULL';
        }

        $searchForm.find( 'select' ).not( '[name="query"],[name="location"],[name="distance"]' ).each(function() {
            //console.log($( this ).attr( 'id' ));
            var value = $( this ).val();
            if ( value.length > 0 ) {
                sql += (( value === '' ) ? '' : ' AND ' + 'upper("' + this.name + '") LIKE upper(\'%' + value + '%\' )' );
            }
        });

        sql += ' ' + sqlOrderBy;
        //console.log( 'sql', sql );

        // request data from CKAN
        qg.data.get( dataEnvironment, sql, {
            cache: true,
            successCallback: function( data ) {
                //console.log( 'getData successCallback' );
                //console.log( data.result );
                if ( data.result.records.length > 0 ) {
                    jsonData = data;
                    addDataToMap( state );
                } else {
                    // got empty data set
                    $( document ).status( 'show', {
                        status: 'info',
                        lightbox: true,
                        title: 'Your search did not return any results',
                        body: '<p>Please search again using search terms or options.</p>'
                    });
                    // remove loading placeholder
                    $viewportResults.nextAll( '.loading' ).remove();
                    // show the search (BAM only, SAM does not contain #app-viewport-tools)
                    $viewportTools.removeClass( 'search-results' );
                }
            }
        });
        //console.log( 'getData end' );
    };

    // get new data
    getData = function( state ) {
        //console.log( 'getData start' );

        // if we are just showing the viewport, bail out
        if ( state.viewport === true ) {
            return;
        }

        // extend state object
        state.search = $.extend({
            query: '',
            location: '',
            distance: 1000
        }, state.search );

        // don't redraw map if data hasn't changed
        if ( state.refresh === false ) {
            addDataToMap( state );
            return;
        }

        // show loading for search results
        $viewportResults.removeClass( 'visuallyhidden' ).hide().find( 'ol' ).empty();
        // loading! (remove any loading divs hanging around)
        $viewportResults .nextAll( '.loading' ).remove().end().after( '<div class="loading"/>' );

        // load geocode data
        getLocationGeocode( state.search );

    };


    // reset the map
    mapReset = function() {
        var url = $.url(),
            historyState = {},
            searchState = {}
            ;

        //console.log( 'mapReset()', url );
        $.each( url.param(), function( name, v ) {
            searchState[ name ] = v;
            //console.log( 'setting form value from param', name, v );
            $( $searchForm[ 0 ][ name ] ).val( v );
        });
        $.each( url.fparam(), function( name, v ) {
            searchState[ name ] = v;
            //console.log( 'setting form value from fparam', name, v );
            $( $searchForm[ 0 ][ name] ).val( v );
        });

        if ( searchState.title ) {
            historyState.title = searchState.title;
        }
        historyState.search = searchState;

        getData( historyState );
        // History.pushState( historyState, document.title, $.url().attr( 'source' ));
    };

    mapReset();


    // history state management
    History.Adapter.bind( window, 'statechange', function() {
        var state = History.getState();

        //console.log( 'statechange', state );

        // load page
        if ( state.title === '' ) {
            //console.log( 'statechange', 'initialise' );
            map.removeLayer( circle ).removeLayer( QUEENSLAND );

            if ( BAM ) {
                swe.pageModel.initialise();
            } else {
                toggleView( false );
            }
            mapReset();

            // showInfo?
        } else if ( state.data.id ) {
            //console.log( 'statechange', 'showInfo via getData' );
            $viewportInfo.empty().append( '<div class="loading"/>' );
            if ( BAM ) {
                swe.pageModel.refresh({ show: 'viewport-info' });
            }

            // get data
            getData( state.data );

            // search results (where the main action happens)
        } else if ( typeof state.data.search === 'object' ) {
            //console.log( 'statechange', 'search results' );
            map.removeLayer( circle ).removeLayer( QUEENSLAND );
            if ( BAM ) {
                swe.pageModel.refresh({ hide: 'viewport-info' });
            }
            // set search form
            $.each( state.data.search, function( name, value ) {
                var _value = ( name === 'location' ) ? value.replace( /\+/g, ' ' ) : value;
                $( $searchForm[ 0 ][ name ] ).val( _value );
            });
            if ( BAM ) {
                if ( state.data.viewport === true ) {
                    swe.pageModel.refresh({ hide: 'viewport-tools' });
                } else {
                    swe.pageModel.refresh({ show: 'viewport-tools' });
                }
            } else {
                toggleView( false );
            }

            // get data
            getData( state.data );

            // TODO: add in set search field method

            // show map (hide panels)
        } else if ( state.data.viewport === true ) {
            //console.log( 'statechange', 'show map (hide panels)' );
            map.removeLayer( circle ).removeLayer( QUEENSLAND );

            if ( BAM ) {
                swe.pageModel.initialise();
            } else {
                toggleView( false );
            }
        }
    });

    // Set the geocode results in the DOM
    setResults = function( data, links ) {
        // set list container
        var $ol = $( '<ol id="resultsList"></ol>' );

        // check how we display the data
        if ( typeof data === 'string' ) {
            $ol.append( $( '<li>' + data + '</li>' ) );
        } else {
            for ( var key in data ) {
                if( key ) {
                    var $text = ( links ) ? $( '<a href="#">' + data[key] + '</a>' ) : data[key];
                    var $node = $( '<li></li>').append( $text );
                    $ol.append( $node );
                }
            }
        }

        if( $( $searchForm ).find( '.results' ).length ) {
            $( $searchForm ).find( '.results' ).empty().append( $ol );
        } else {
            $( $searchForm ).append( $( '<div class="results"></div>' ).append( $ol ) );
        }
    };

// create geolocation button
    if ( $geocoding.length === 0 && $searchLocation.length > 0 && navigator.geolocation ) {
        $searchLocation.parent().addClass( 'location' );
        $geocoding = $( '<a href="#" id="app-geocoding" aria-label="Search by your location" title="Search by your location"><svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 480 480" enable-background="new 0 0 480 480"><path d="M240 159.909c-44.235 0-80.091 35.859-80.091 80.091s35.855 80.091 80.091 80.091c44.231 0 80.091-35.859 80.091-80.091s-35.86-80.091-80.091-80.091zm160 66.758h-25.694c-6.267-63.891-57.086-114.701-120.973-120.967v-25.7c0-7.363-5.97-13.333-13.333-13.333s-13.333 5.97-13.333 13.333v25.701c-63.889 6.266-114.705 57.075-120.971 120.966h-25.696c-7.363 0-13.333 5.97-13.333 13.333s5.97 13.333 13.333 13.333h25.696c6.266 63.891 57.082 114.7 120.971 120.966v25.701c0 7.363 5.97 13.333 13.333 13.333s13.333-5.97 13.333-13.333v-25.701c63.888-6.266 114.707-57.075 120.974-120.966h25.693c7.363 0 13.333-5.97 13.333-13.333s-5.97-13.333-13.333-13.333zm-160 121.002c-59.463 0-107.666-48.209-107.666-107.669s48.203-107.669 107.666-107.669c59.466 0 107.669 48.209 107.669 107.669s-48.203 107.669-107.669 107.669z" fill-rule="evenodd" clip-rule="evenodd"/></svg></a>' ).insertAfter( $searchLocation );
        // Clicking on the location button should return the current geocode data
        $geocoding.on( 'click', function( event ) {
            // Reset some DOM elements
            $searchLocation.val( '' );
            $( $searchForm ).find( '.results' ).empty();
            // If we have this capability, then we can search by reverse lookup
            if ( navigator.geolocation ) {
                // If we can, use W3C method to get position coords
                navigator.geolocation.getCurrentPosition( function ( position ) {
                    locLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
                    // Use Google Maps to return geocode results (it works best)
                    getReverseGeocode( position.coords );
                });
            } else {
                // or add in error message
                setResults( 'Sorry, you must search for your location' );
            }
            event.preventDefault();
        });
    }

    // searching should update map
    $( $searchForm ).on( 'submit', function( event ) {

        var searchState = getSearchState(),
            queryString,
            mapQuery
            ;

        queryString = $.map( searchState, function( value, key ) {
            var _value = null;
            if ( value && value.length > 0 ) {
                _value = ( key === 'location' ) ? ( key + '=' + value ) : ( encodeURIComponent( key ) + '=' + encodeURIComponent( value ) );
            }
            return _value;
        });

        // console.log(queryString);

        // Google Analytics for map interaction (2/3)
        mapQuery = baseURL + '?' + queryString;
        //_gaq.push(
        //    [  qg.swe.GATracker +'._trackEvent', 'click', 'map-search', 'search query: ' + mapQuery , 0, true ]
        //);

        History.pushState( { search: searchState }, baseTitle, queryString.length > 0 ? '?' + queryString.join( '&' ) : baseURL );

        event.preventDefault();
        return false;
    });


    // clicking 'Show all' link in search should reset
    $searchForm.on( 'click', '.all, .reset', function( event ) {
        $searchForm.find('ol').not('.footer-section').find( 'input' ).not( ':hidden, :submit' ).add( 'select' ).val( '' );
        $searchForm.submit();
        event.preventDefault();
        return false;
    });


    // clicking on a search result should show that result
    $( '.search-results', '#app-viewport-tools-results' ).on( 'click', 'a', function( event ) {
        var id = $.url( $( this ).attr( 'href' )).param( 'title' ),
            title = $( this ).text()
            ;

        History.pushState({ id: id, title: title, search: getSearchState(), refresh: false }, baseTitle.replace( /^[^\|]*/, title + ' ' + baseTitle ), baseURL + '?title=' + id );

        // Google Analytics for map interaction (3/3)
        //_gaq.push(
        //    [  qg.swe.GATracker +'._trackEvent', 'click', 'map-search-result', 'click: ' + title , 0, true ]
        //);

        event.preventDefault();
        return false;
    });

    // refine search should show the search form
    // BAM only (SAM has no #app-viewport-tools)
    $viewportTools.on( 'click', '.refine', function() {
        $viewportTools.removeClass( 'search-results' );
        return false;
    });


    // clicking on the viewport overlay should track history
    $( '#large-application' ).on( 'click', '#app-viewport-overlay', function() {
        History.pushState({ viewport: true, search: getSearchState() }, baseTitle, baseURL );
    });


    // links to filter search results
    // use history state instead of a page refresh
    $( '.key' ).on( 'click', 'a', function( event ) {
        var title,
            state,
            url = $.url( this )
            ;

        // is this link a query string?
        if ( url.attr( 'source' ).indexOf( baseURL ) !== 0 ) {
            // passthrough to other/default link handlers
            return true;
        }

        // intercept
        event.preventDefault();

        // is this link a 'filter'
        if ( $( this ).is( '.filter a' )) {
            // update the search and submit
            $.each( url.param(), function( name, v ) {
                $( $searchForm[ 0 ][ name] ).val( v );
            });
            $searchForm.submit();

        } else {
            // not a filter, refresh the map
            title = baseTitle;
            state = {
                viewport: true,
                search: url.param()
            };

            // special handling for title param
            if ( state.search.title ) {
                state.title = state.search.title;
                title = title.replace( /^[^\|]*/, url.param( 'title' ) + ' ' + baseTitle );
            }
            delete state.search.title;

            // special handling for id param
            if ( state.search.id ) {
                state.id = state.search.id;
            }
            delete state.search.id;

            History.pushState( state, baseTitle, this.href );
        }

        return false;
    });


    // viewport controls
    $( 'a', '#app-viewport-controls' )
        .filter( '[href $= "#app-viewport-data"]' )
        .butterfly({
            contentDefaultWidth: '100%',
            reuseFragment: true
        })
    ;

    $( '#app-viewport-controls' ).on( 'click', 'a', function() {
        $( this.href.replace( /^[^#]+/, '' )).stop( true, true ).fadeToggle();
        return false;
    });


    // click to close bubbles
    $( '.viewport-bubble' ).on( 'click', '.close', function(){
        $( this ).closest( '.viewport-bubble' ).hide();
    });


    // hide bubbles on mobile
    if ( swe.isMobile ) {
        $( '.close', '.viewport-bubble' ).click();
    }


}( jQuery, qg.swe, History ));
