/* globals jQuery, qg, Placeholders, Handlebars, routie */
/* jshint unused:false, sub:true, expr:true */

if (!String.prototype.contains) {
    String.prototype.contains = function (arg) {
        'use strict';
        return !!~this.indexOf(arg);
    };
}

qg.swe.load({ name: 'data', url: 'data.js' });

qg.swe.services = (function ($, swe) {
    'use strict';

    // jquery objects
    var $list = $('#services'),
        $form = $('#services-form'),
        $widget = $('#services-widget'),
        $search = $('#services-search');

    var template = {
        error: $('#error-template').html(),
        warn: $('#warn-template').html(),
        list: $('#list-template').html(),
        widget: $('#widget-template').html()
    };

    // arguments
    var args = {
        orderBy: 'service',
        category: {
            title: 'Transport and motoring',
            slug: 'transport-and-motoring'
        },
        resource: {
            id: 'c361766e-f9d4-490a-817d-5effbdd97ba5',
            url: 'staging.data.qld.gov.au'
        }
    };

    // locations
    var locations = {
        root: {
            'kiosk-friendly': null,
            'kiosk-only': false,
            'print-required': null,
            'wide-display': false
        },
        jimboomba: {
            'kiosk-friendly': true,
            'kiosk-only': true,
            'print-required': null,
            'wide-display': false
        },
        laidley: {
            'kiosk-friendly': true,
            'kiosk-only': true,
            'print-required': null,
            'wide-display': true
        },
        plainlands: {
            'kiosk-friendly': true,
            'kiosk-only': true,
            'print-required': null,
            'wide-display': true
        }
    };

    var services = {
        init: function () {
            // properties
            this.props = {
                types: null,
                route: null,
                query: null,
                params: null,
                location: null,
                kiosk: null
            };

            // events
            this.event.submit();
            this.event.reset();
            this.get.types();
            this.get.route();
            this.get.query();
            this.set.toggle();

            // empty
            services.empty();

            // routes
            routie({
                '/': function () {
                    //console.log('Route: root');
                    services.empty();
                    services.set.form();
                    services.set.location();
                    services.set.route();
                    services.set.params(services.props.location);
                    services.set.kiosk(services.props.location);
                    services.get.query();
                    services.data.online();
                    services.data.offline();
                    services.data.widget(args.category.slug);
                },
                '/:query': function (value) {
                    //console.log('Route: query');
                    services.empty();
                    services.set.form(value);
                    services.set.location();
                    services.set.route();
                    services.set.params(services.props.location);
                    services.set.kiosk(services.props.location);
                    services.get.query();
                    services.data.online();
                    services.data.offline();
                    services.data.widget(args.category.slug);
                },
                '/location/:name': function (value) {
                    //console.log('Route: location');
                    services.empty();
                    services.set.form(value);
                    services.set.location(value);
                    services.set.route('/location/' + value);
                    services.set.params(services.props.location);
                    services.set.kiosk(services.props.location);
                    services.get.query();
                    if (!!services.props.params) {
                        services.data.online();
                        services.data.offline();
                        services.data.widget(args.category.slug);
                    }

                }
            });

            // run route
            routie(services.props.route + (!!services.props.query ? ('?' + services.props.query) : ''));
        },
        empty: function () {
            $list.empty();
            $widget.empty();
        },
        event: {
            submit: function () {
                $form.submit(function (event) {
                    event.preventDefault();
                    var values = [];
                    $form.find('.form-section').find('input, select').each(function () {
                        !$(this).val() || values.push($(this).attr('id') + '=' + $(this).val().replace(/ /g, '+'));
                    });
                    services.set.query(values);
                });
            },
            reset: function () {
                $form.find('.reset').bind('click', function (event) {
                    event.preventDefault();
                    services.get.route();
                    if (!!window.location.search) {
                        routie(services.props.route + window.location.search);
                    } else {
                        routie(services.props.route);
                    }
                });
            },
            toggle: function () {
                $('#services-toggle').bind('click', function (e) {
                    e.preventDefault();
                    $form.is(':visible') ? $form.addClass('hide') : $form.removeClass('hide');
                    $form.is(':visible') ? $(this).addClass('up') : $(this).removeClass('up');
                });
            }
        },
        parse: {
            online: function (records) {
                var result = {
                    type: {},
                    length: records.length
                };
                for (var key in records) {
                    if (records.hasOwnProperty(key)) {
                        var type = records[key]['type-slug'];
                        if (!result.type.hasOwnProperty(type)) {
                            result.type[type] = {
                                services: [],
                                title: services.props.types[type],
                                image: type
                            };
                        }
                        result.type[type].services.push(records[key]);
                    }
                }
                return result;
            },
            offline: function (records) {
                var result = [];
                for (var key in records) {
                    if (records.hasOwnProperty(key)) {
                        result.push(records[key]);
                    }
                }
                return result;
            },
            widget: function (records) {
                var result = {services: [], category: args.category};
                for (var key in records) {
                    if (records.hasOwnProperty(key)) {
                        records[key].available = ('yes' === records[key].available) ? !0 : !1;
                        result.services.push(records[key]);
                    }
                }
                return result;
            }
        },
        show: {
            error: function (message) {
                var wrapper = {error: message},
                    populate = Handlebars.compile(template.error);
                $list.empty().append(populate(wrapper)).trigger('x-height-change');
            },
            online: function (data) {
                if (data.success && data.result.records.length) {
                    var result = services.parse.online(data.result.records),
                        wrapper = {items: result},
                        populate = Handlebars.compile(template.list);
                    $list.append(populate(wrapper)).trigger('x-height-change');
                } else {
                    services.show.error(null);
                }
            },
            offline: function (data) {
                if (data.success && data.result.records.length) {
                    var result = services.parse.offline(data.result.records),
                        wrapper = {items: result},
                        populate = Handlebars.compile(template.warn);
                    $list.prepend(populate(wrapper)).trigger('x-height-change');
                }
            },
            widget: function (data) {
                if (data.success && data.result.records.length) {
                    var result = services.parse.widget(data.result.records),
                        wrapper = {items: result},
                        populate = Handlebars.compile(template.widget);
                    $widget.append(populate(wrapper)).trigger('x-height-change');
                }
            }
        },
        data: {
            online: function () {
                var query = null,
                    filter = services.get.filter(),
                    params = services.get.params(),
                    order = services.get.order();
                // if the keywords are set, construct a filter OR get everything
                if (!!services.props.query && services.props.query.contains('keywords')) {
                    var keywords = services.props.query.split('keywords').pop().substr(1);
                    query = 'SELECT * FROM "' + args.resource.id + '"' + ', plainto_tsquery( \'english\', \'' + keywords + '\' ) query' + filter + params + ' AND _full_text @@ query' + ' AND (\"available\"=\'yes\')' + ' ORDER BY ' + order + ', \"' + args.orderBy + '\"';
                } else {
                    query = 'SELECT * FROM \"' + args.resource.id + '\"' + filter + params + ' AND (\"available\"=\'yes\')' + ' ORDER BY ' + order + ', \"' + args.orderBy + '\"';
                }
                // run the data query method
                qg.data.get(args.resource.url, query, services.show.online);
            },
            offline: function () {
                var filter = services.get.filter(),
                    params = services.get.params(),
                    order = services.get.order(),
                    query = 'SELECT * FROM \"' + args.resource.id + '\"' + filter + params + ' AND (\"available\"=\'no\')' + ' ORDER BY ' + order + ', \"' + args.orderBy + '\"';
                // run the data query method
//                qg.data.get(args.resource.url, query, services.show.offline);
            },
            widget: function (category) {
                // if the category is set, construct a filter OR get everything
                if (!!category && !!$widget.length) {
                    var filter = ' WHERE 1=1',
                        params = services.get.params(),
                        order = services.get.order(),
                        query = 'SELECT * FROM \"' + args.resource.id + '\"' + filter + params + ' AND (\"category-slug\"=\'' + category + '\')' + ' ORDER BY ' + order + ', \"' + args.orderBy + '\"';
                    // run the data query method
//                    qg.data.get(args.resource.url, query, services.show.widget);
                }
            }
        },
        check: {
            location: function (value) {
                return locations.hasOwnProperty(value);
            }
        },
        get: {
            types: function () {
                var list = {};
                $('#type').find('option').each(function (key, item) {
                    if (!!$(item).val()) {
                        list[$(item).val()] = $(item).text();
                    }
                });
                services.props.types = list;
            },
            query: function () {
                if (!!window.location.hash && window.location.hash.contains('?')) {
                    services.props.query = window.location.hash.split('?').pop();
                } else {
                    services.props.query = null;
                }
            },
            route: function () {
                if (!!window.location.hash) {
                    services.props.route = window.location.hash.split('?').shift().substr(1);
                } else {
                    services.props.route = '/';
                }
            },
            order: function () {
                var count = 0,
                    result = '(CASE \"type-slug\"';
                $.each( services.props.types, function( key, value ) {
                    count++;
                    result += ' WHEN \'' + key + '\' THEN ' + (count);
                });
                result += ' END)';
                return result;
            },
            filter: function () {
                var query = ' WHERE 1=1';
                if (!!services.props.query) {
                    var values = services.props.query.split('&');
                    for (var key in values) {
                        if (values.hasOwnProperty(key)) {
                            var column = values[key].split('=').shift(),
                                value = values[key].split('=').pop();
//                            if (column === 'keywords') {
//                                query += ' AND (\"' + 'query' + '\"=\'' + value + '\')';
//                            } else {
//                                query += ' AND (\"' + (column + '-slug') + '\"=\'' + value + '\')';
//                            }
                            if (column !== 'keywords') {
                                query += ' AND (\"' + (column + '-slug') + '\"=\'' + value + '\')';
                            }
                        }
                    }
                }
                return query;
            },
            params: function () {
                var query = '';
                if (!!services.props.params) {
                    var array = [];
                    var values = services.props.params.split('&');
                    for (var key in values) {
                        if (values.hasOwnProperty(key)) {
                            var column = values[key].split('=').shift(),
                                value = values[key].split('=').pop();
                            array.push('(\"' + column + '\"=\'' + value + '\')');
                            //query += ' AND (\"' + column + '\"=\'' + value + '\')';
                        }
                    }
                    query += ' AND (' + array.join(' OR ') + ')';
                }
                return query;
            },
            location: function () {
                var values = [];
                $.map(locations[services.props.location], function (value, key) {
                    if (value !== null && key !== 'wide-display') {
                        values.push(key + '=' + services.set.truth(value));
                    }
                });
                return values.join('&');
            }
        },
        set: {
            query: function (value) {
                // set query
                services.props.query = value.join('&');
                // run route
                routie(services.props.route + (!!services.props.query ? ('?' + services.props.query) : ''));
            },
            route: function (value) {
                // if the value is passed in then route is set
                if (!!value) {
                    services.props.route = (value.contains('?')) ? value.split('?').shift() : value;
                } else {
                    services.props.route = '/';
                }
            },
            form: function (value) {
                var query = null;
                // if the value is passed in and contains search params
                if (!!value && value.contains('?')) {
                    query = value.split('?').pop();
                } else {
                    query = window.location.hash.contains('?') && window.location.hash.split('?').pop();
                }
                // then, if we have a query, then set the form
                if (!!query) {
                    // loop through each and set form value
                    var values = {};
                    query.split('&').map(function (item) {
                        var id = item.split('=').shift();
                        values[id] = item.split('=').pop();
                    });
                    $form.find('.form-section').find('input, select').each(function () {
                        var id = $(this).attr('id');
                        if (values.hasOwnProperty(id)) {
                            $(this).val(values[id]);
                        } else {
                            $(this).val('');
                        }
                    });
                } else {
                    $form.find('.form-section').find('input, select').each(function () {
                        $(this).val('');
                    });
                }
            },
            params: function (value) {
                // check if location is valid, then set params
                if (!!value) {
                    if (!!services.check.location(value)) {
                        services.props.params = services.get.location();
                    } else {
                        services.show.error('This location is unavailable.');
                        services.props.params = null;
                    }
                } else {
                    services.props.params = null;
                }
            },
            truth: function (value) {
                return (!!value) ? 'yes' : 'no';
            },
            location: function (value) {
                if (!!value) {
                    services.props.location = value.split('?').shift();
                } else {
                    services.props.location = 'root';
                }
            },
            kiosk: function (value) {
                if (!!locations.hasOwnProperty(value) && locations[value]['wide-display']) {
                    services.props.kiosk = !!locations[value]['wide-display'];
                    $( 'body' ).addClass( 'kiosk' );
                } else {
                    $( 'body' ).removeClass( 'kiosk' );
                }
            },
            toggle: function () {
                $search.find('.widget-header').append($('<span class="action"><a href="#" id="services-toggle" class="up">Toggle</a></span>'));
                services.event.toggle();
            }
        }
    };

    return services;

}(jQuery, qg.swe));