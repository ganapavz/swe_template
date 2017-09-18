/* jshint indent: false, camelcase: false */

(function ($, window, document, undefined) {
    'use strict';

    // Create the defaults once
    var pluginName = 'sectionRunner',
        dataKey = 'plugin-' + pluginName,
        defaults = {
            grouping: 3,
            lists: true,
            fluid: false
        };

    // The actual plugin constructor
    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        // kick off
        this.init();
    }

    Plugin.prototype = {
        init: function () {
            // include wrapper if not already set
            if ( !$( this.element ).find( '.list' ).length ) {
                $( this.element ).wrapInner( '<div class="list"></div>' );
            }
            // set dom objects
            this.id = $( this.element ).attr( 'id' );
            this.list = $( this.element ).find( '.list' );
            this.items = $( this.list ).find( 'li' );
            // set dom parameters
            var params = {
                resize: false,
                height: null,
                width: null,
                segment: null,
                showing: this.settings.grouping,
                count: this.items.size()
            };
            // extend settings with params
            $.extend(this.settings, params);
            // set objects and events
            this.setup();
        },
        setup: function () {
            // set the layout and parameters
            this.setLayout();
            this.setParameters();
        },
        /**
         * getters
         * */
        getElementWidth: function () {
            return $( this.element ).width();
        },
        getItemsHeight: function () {
            // get an array of all element heights
            this.element.find( '.section > ul' ).removeAttr( 'style' );
            var heights = this.element.find( '.section > ul' ).map(function () {
                return $(this).height();
            }).get();
            return Math.max.apply(null, heights);
        },
        getElementHeight: function () {
            return this.element.height();
        },
        /**
         * setters
         * */
        setResize: function () {
            // set resize to true
            this.settings.resize = true;
            this.setParameters();
        },
        setLayout: function() {
            var _this = this;
            if ( this.settings.lists ) {
                // remove the ul
                $( this.list ).find( 'ul' ).remove();
                // remove the section wrapper
                $( this.list ).find( '.section' ).remove();
                // append the columns
                for (var i = 1; i <= this.settings.showing; i++) {
                    $( this.list ).append( $( '<div class="section"></div>' ).append( $( '<ul></ul>' ) ) );
                }
                var count = Math.ceil(_this.settings.count / _this.settings.showing);
                var column = 0;
                // append the items to the columns
                $.each( this.items, function ( index ) {
                    if ( (index > 0) && ((index / count)%1 === 0)) {
                        column ++;
                        if (column > _this.settings.showing) {
                            column = _this.settings.showing-1;
                        }
                    }
                    $( _this.list ).find( '.section' ).eq( column ).find( 'ul' ).append( $( _this.items ).eq( index ) );
                });
            }
        },
        setProperties: function () {
            if ( this.settings.fluid ) {
                // set section width
                $( this.list ).find( '.section' ).width( this.settings.segment );
            }
            // set list length
            this.list.css({
                width: ( this.settings.count * this.settings.segment ),
                marginLeft: 0
            });
            // set the section height
            //this.settings.height = this.getItemsHeight();
            //$( this.list ).find( '.section > ul' ).height( this.settings.height );
            // reset the resize property
            this.settings.resize = false;
        },
        setParameters: function () {
            var width = $( window ).innerWidth();
            var showing, segment = 0.35;
            if (width >= 962) {
                segment = 0.35;
                showing = this.settings.grouping;
            } else if (width > 624) {
                segment = 0.54;
                showing = this.settings.grouping - 1;
            } else if (width < 624) {
                segment = 1.2;
                showing = this.settings.grouping - 2;
            }
            // check if showing is different to global
            if (showing !== this.settings.showing) {
                // set the layout
                this.settings.showing = showing;
                this.setLayout();
            }
            // set the properties
            this.settings.segment = parseInt($( this.element ).width() * segment, 10);
            this.setProperties();
        }
    };
    /**
     * Plugin wrapper, preventing against multiple instantiations and
     * return plugin instance.
     */
    $.fn[ pluginName ] = function ( options ) {
        // if no id set then generate one
        if ( !$( this ).attr( 'id' ) ) {
            $( this ).attr( 'id', dataKey + '-' + options.key );
        }
        // plugin object
        var plugin = this.data( dataKey );
        // has plugin instantiated ?
        if (plugin instanceof Plugin) {
            // if have options arguments, call plugin.init() again
            if (typeof options !== 'undefined') {
                plugin.init( options );
            }
        } else {
            plugin = new Plugin( this, options );
            this.data( dataKey, plugin );
        }
        // return this to allow public methods
        return plugin;
    };

}( jQuery, window, document ));