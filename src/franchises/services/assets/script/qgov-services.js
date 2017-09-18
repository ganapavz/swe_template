/* globals jQuery, qg, markdown, _gaq, History, Placeholders, Handlebars */
/* jshint unused:false, sub:true, expr:true */

if (!String.prototype.contains) {
    String.prototype.contains = function (arg) {
        'use strict';
        return !!~this.indexOf(arg);
    };
}

qg.swe.load({ name: 'data', url: 'data.js' });

qg.swe.services = (function ($, swe, History, Placeholders) {
    'use strict';

    var state = {},
        params = {},
        fparams = {};

    var base = {
        title: document.title,
        href: window.location.href.replace( /[#?].*$/, '' )
    };

    var args = {
        orderBy: 'Service',
        resourceId: 'ff61bed8-f2ff-42ef-9224-648399a59d4b',
        category: '', // Transport and motoring
        location: (base.href.contains('qld.gov.au')) ? '' : 'http://www.qld.gov.au'
    };

    var tmp = {
        error: $('#error-template').html(),
        warn: $('#warn-template').html(),
        list: $('#list-template').html(),
        widget: $('#widget-template').html()
    };

    var $list = $('#services'),
        $form = $('#services-form'),
        $widget = $('#services-widget'),
        $search = $('#services-search'),
        $loading = $('<p>Loading data...</p>');

    function testPropertyExists(property) {
        return state[property] && (typeof state[property] !== 'undefined' || typeof state[property] !== null );
    }

    function stringReplacement(property) {
        return state[property].replace(/\+/g, ' ').replace(/\%2C/g, ',');
    }

    function getFilterValues() {
        var query = ' WHERE 1=1';
        if (args.params) {
            var key;
            for (key in args.params) {
                if (args.params.hasOwnProperty(key)) {
                    testPropertyExists(key) && (query += ' AND (\"' + args.params[key] + '\"=\'' + stringReplacement(key) + '\')');
                }
            }
        }
        return query;
    }

    function getOrderByValues() {
        return '(CASE \"Type\"' +
            ' WHEN \'Pay it\' THEN 1' +
            ' WHEN \'Find it\' THEN 2' +
            ' WHEN \'Apply for it\' THEN 3' +
            ' WHEN \'Buy it\' THEN 4' +
            ' WHEN \'Report it\' THEN 5' +
            ' END)';
    }

    var services = {
        log: function (val) {
            services.set.log();
            if (typeof val === 'string') {
                $('#logger').empty().html(val);
            } else if (typeof val === 'object') {
                var key, tmp = $('<ul/>');
                for (key in val) {
                    if (val.hasOwnProperty(key)) {
                        tmp.append($('<li><b>' + key + ': </b>' + val[key] + '</li>'));
                    }
                }
                $('#logger').empty().html(tmp);
            }

        },
        init: function () {
            $list.empty();
            $widget.empty();
            services.set.searchParams();
            services.set.searchReset();
            services.set.searchValues();
            services.set.toggleLink();

            services.get.searchState();
            services.get.online();
            services.get.offline();
            services.get.widget(args.category);

            services.event.submitForm();
            services.event.getAllResults();
        },
        get: {
            // load json data
            online: function () {
                var sql = null;
                if (testPropertyExists('Query')) {
                    sql = 'SELECT * FROM "' + args.resourceId + '"' +
                        ', plainto_tsquery( \'english\', \'' + state['Query'] + '\' ) query' +
                        getFilterValues() +
                        ' AND _full_text @@ query' +
                        ' AND (\"Available\"=\'Yes\')' +
                        ' ORDER BY ' + getOrderByValues() +  ', \"' + args.orderBy + '\"';
                } else {
                    sql = 'SELECT * FROM \"' + args.resourceId + '\"' +
                        getFilterValues() +
                        ' AND (\"Available\"=\'Yes\')' +
                        ' ORDER BY ' + getOrderByValues() +  ', \"' + args.orderBy + '\"';
                }
                // insert the loading message
                $list.empty().append($('<p/>').append($loading.text()));
                // run the data query method
                qg.data.get('data.qld.gov.au', sql, services.show.online);
            },
            offline: function () {
                var sql = 'SELECT * FROM \"' + args.resourceId + '\"' + getFilterValues()  +
                    ' AND (\"Available\"=\'No\')' +
                    ' ORDER BY ' + getOrderByValues() + ', \"' + args.orderBy + '\"';
                // run the data query method
                qg.data.get('data.qld.gov.au', sql, services.show.offline);
            },
            widget: function (category) {
                if (category.length > 0) {
                    var sql = 'SELECT * FROM \"' + args.resourceId + '\"' + getFilterValues() +
                        ' AND (\"Category\"=\'' + category + '\')' +
                        ' ORDER BY ' + getOrderByValues() + ', \"' + args.orderBy + '\"';
                    // insert the loading message
                    $widget.empty().append($('<div class="aside"/>').html($loading));
                    // run the data query method
                    qg.data.get('data.qld.gov.au', sql, services.show.widget);
                }
            },
            // get search state, for history
            searchState: function () {
                $form.find('ol').not('.footer-section').find('input, select, textarea').each( function () {
                    // disable placeholder polyfill
                    Placeholders.disable( this );
                    state[ this.name ] = ( $(this).val() !== null || $(this).val() !== '' ) ? $( this ).val().replace( / /g, '+' ) : $( this ).val();
                    Placeholders.enable( this );
                });
            }
        },
        set: {
            // set the log for debugging
            log: function() {
                if (!$('#logger').length) {
                    $('body').prepend($('<div id="logger">test</div>'));
                }
            },
            // set the visible search fields
            searchParams: function () {
                args.params = {};
                $form.find('.param').each( function () {
                    args.params[$(this).attr('name')] = $(this).attr('name').replace( /_/g, ' ' );
                });
            },
            // set the reset search fields
            searchReset: function () {
                args.reset = [];
                $form.find('.form-section').find('input, select, textarea').each( function () {
                    args.reset.push($(this).attr('name'));
                });
            },
            searchValues: function () {
                // this updates the search form fields
                if (args.params) {
                    var url = $.url();

                    $.each(url.param(), function (key, value) {
                        (value.length > 0) && (params[key] = value);
                        $search.find('[name="' + key + '"]').val(value);
                    });

                    $.each(url.fparam(), function (key, value) {
                        (value.length > 0) && (fparams[key] = value);
                        $search.find('[name="' + key + '"]').val(value);
                    });
                }
            },
            searchClear: function () {
                if (args.reset) {
                    $.each(args.reset, function (key, value) {
                        $search.find('[name="' + value + '"]').val('');
                    });
                }
            },
            toggleLink: function () {
                $search.find('.widget-header').append($('<span class="action"><a href="#" id="services-toggle" class="up">Toggle</a></span>'));
                services.event.servicesToggle();
            }
        },
        // display functions
        show: {
            // show error
            error: function () {
                $list.empty().html(tmp.error).trigger('x-height-change');
            },
            // show online services
            online: function (data) {
                if (data.success && data.result.records.length > 0) {
                    var result = services.parse.online(data.result.records),
                        wrapper = {items: result},
                        populate = Handlebars.compile(tmp.list);
                    $list.empty().append(populate(wrapper)).trigger('x-height-change');
                } else {
                    services.show.error();
                }
            },
            // show offline services
            offline: function (data) {
                if (data.success && data.result.records.length > 0) {
                    var result = services.parse.offline(data.result.records),
                        wrapper = {items: result},
                        populate = Handlebars.compile(tmp.warn);
                    $list.prepend(populate(wrapper)).trigger('x-height-change');
                }
            },
            // show widget
            widget: function (data) {
                if (data.success && data.result.records.length > 0) {
                    var result = services.parse.widget(data.result.records),
                        wrapper = {items: result},
                        populate = Handlebars.compile(tmp.widget);
                    $widget.empty().append(populate(wrapper)).trigger('x-height-change');
                }
            }
        },
        // parse data
        parse: {
            online: function (data) {
                var key, result = {type: {}, length: data.length};
                for (key in data) {
                    if (data.hasOwnProperty(key)) {
                        var type = data[key]['Type'];
                        if (!result.type.hasOwnProperty(type)) {
                            result.type[type] = {
                                services: [],
                                image: type.toLowerCase().replace(/ /g, '-')
                            };
                        }
                        result.type[type].services.push(data[key]);
                    }
                }
                return result;
            },
            offline: function (data) {
                var key, result = [];
                for (key in data) {
                    if (data.hasOwnProperty(key)) {
                        result.push(data[key]);
                    }
                }
                return result;
            },
            widget: function (data) {
                var key, result = {services: [], category: args.category};
                for (key in data) {
                    if (data.hasOwnProperty(key)) {
                        data[key].Available = ('Yes' === data[key].Available) ? !0 : !1;
                        result.services.push(data[key]);
                    }
                }
                return result;
            }
        },
        event: {
            submitForm: function () {
                $form.submit(function (e) {
                    e.preventDefault();
                    services.get.searchState();
                    // construct query
                    var query = $.map( state, function( value, key ) {
                        return ( value.length > 0 ) ? ( key + '=' + value ) : null;
                    });
                    // change history and get search params
                    History.pushState( {search: query}, base.title, (query.length > 0 ? '?' + query.join( '&' ) : base.href) );
                    services.set.searchValues();
                });
            },
            getAllResults: function () {
                $search.find('.reset').bind( 'click', function (e) {
                    e.preventDefault();
                    services.get.searchState();
                    // construct query
                    var query = $.map( state, function( value, key ) {
                        return ( $.inArray(key, args.reset) < 0 ) ? ( value === '' ? null : (key + '=' + value) ) : null;
                    });
                    // change history and get search params
                    History.pushState( { search: query }, base.title, (query.length > 0 ? '?' + query.join( '&' ) : base.href) );
                    services.set.searchClear();
                });
            },
            servicesToggle: function () {
                $('#services-toggle').bind('click', function (e) {
                    e.preventDefault();
                    $form.is(':visible') ? $form.addClass('hide') : $form.removeClass('hide');
                    $form.is(':visible') ? $(this).addClass('up') : $(this).removeClass('up');
                });
            }
        }
    };

    // History state management
    History.Adapter.bind( window, 'statechange', function() {
        var history = History.getState(), query = {};
        // set the query from history obj
        $.map( history.data.search, function( value, key ) {
            var arr = history.data.search[key].split('=');
            query[arr[0]] = arr[1];
        });
        // set the state from the query obj
        $.each( state, function ( key, value ) {
            (query.hasOwnProperty(key)) ? state[key] = value : state[key] = '';
        });
//        console.log( 'statechange', query, state );
        // load data
        services.get.online();
        services.get.offline();
        services.get.widget(args.category);
    });

    return services;

}(jQuery, qg.swe, History, Placeholders));
