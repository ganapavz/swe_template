/* global qg */
/* jshint indent: false, camelcase: false */

(function ($, window, document, undefined) {
    'use strict';

    // Create the defaults once
    var pluginName = 'flexGrid',
        dataKey = 'plugin-' + pluginName,
        timeoutObj = null,
        defaults = {
            delay: 150,
            selector: 'li',
            inner: false
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
            // set dom objects
            this.items = this.element.children( this.settings.selector );
            // include wrapper if not already set
            if ( this.settings.inner && !$( this.element ).find( '.inner' ).length ) {
                $( this.items ).wrapInner( '<div class="inner"></div>' );
            }
            // set extra parameters
            var params = {
                errorMargin: 1, // FF requires 1px error margin
                grouping: null,
                heights: null
            };
            // extend settings with params
            $.extend(this.settings, params);
            // set objects and events
            this.setLayout();
        },
        setLayout: function () {
            var _this = this;
            // reset all grid members
            this.items.height( 'auto' ).removeClass( 'flex-grid-new-row');
            // calc how many members per row
            this.settings.grouping = Math.floor( this.element.innerWidth() / (this.items.eq(0).outerWidth(true) - this.settings.errorMargin) );
            // return if only one per row
            if ( this.settings.grouping < 2 ) {
                return;
            }
            // get heights of each item as array
            this.settings.heights = this.items.map(function () {
                return $(this).height();
            }).get();

            // loop through and start new row for each grouping element
            this.items.each( function( index ) {
                // set height value based on percentage of grouping
                if (index % _this.settings.grouping === 0) {
                    _this.items.eq( index ).addClass( 'flex-grid-new-row' );
                    // set height property on all elements in row
                    var heights = _this.settings.heights;
                    var last = (index+_this.settings.grouping > _this.items.length) ? _this.items.length : index+_this.settings.grouping;
                    var subset = heights.slice(index, last);
                    // set height on subset itmes
                    for (var i = index; i < index+_this.settings.grouping; i++) {
                        _this.items.eq( i ).height( Math.max.apply(null, subset) );
                    }
                }
            });
        },
        reset: function () {
            var _this = this;
            // include function as scoped var
            var resetLayout = function() {
                _this.settings.timeout = null;
                _this.setLayout();
            };
            // if old ie then run timeout
            if ( qg.oldIE ) {
                if ( this.settings.timeout !== null ) {
                    window.clearTimeout( timeoutObj );
                    this.settings.timeout = true;
                }
                timeoutObj = window.setTimeout( resetLayout, _this.settings.delay );
            }
            // else just run - most browsers don't require a delay
            else {
                resetLayout();
            }
        }
    };
    /**
     * Plugin wrapper, preventing against multiple instantiations and
     * return plugin instance.
     */
    $.fn[ pluginName ] = function ( options ) {
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