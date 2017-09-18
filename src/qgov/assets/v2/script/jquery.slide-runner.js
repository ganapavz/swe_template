/* jshint indent:false, camelcase:false, unused:false */

(function ($, window, document, undefined) {
    'use strict';

    // Create the defaults once
    var pluginName = 'slideRunner',
        dataKey = 'plugin-' + pluginName,
        defaults = {
            grouping: 3,
            timeout: 3,
            duration: 500,
            marginOffset: 50,
            activeClass: 'active',
            easing: 'linear',
            controlsPosition: 'above',
            autoplay: false,
            fluid: false
        };

    // The actual plugin constructor
    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._options = options;
        this._name = pluginName;
        // kick off
        this.init();
    }

    Plugin.prototype = {
        init: function () {
            // include wrapper if not already set
            if (!$(this.element).find( '.list' ).length) {
                $(this.element).wrapInner( '<div class="list"></div>' );
            }
            // set dom objects
            this.id = $(this.element).attr( 'id' );
            this.list = $(this.element).find( '.list' );
            this.items = $(this.element).find( '.section' );
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
            // add extra params
            this.click = true;
            this.index = 0;
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
            return $(this.element).width();
        },
        getJumpSpeed: function (a, b) {
            return (((a - b) * this.settings.segment) / (this.settings.duration / 100) > this.settings.duration) ? ((a - b) * this.settings.segment) / (this.settings.duration / 100) : this.settings.duration;
        },
        getItemsHeight: function () {
            // get an array of all element heights
            var heights = this.items.map(function () {
                return $(this).height();
            }).get();
            return Math.max.apply(null, heights);
        },
        getElementHeight: function () {
            return this.getItemsHeight() + $(this.element).find( '.controls' ).height();
        },
        /**
         * setters
         * */
        setLayout: function() {
            if ( !$(this.items).find( '.slide' ).length ) {
                $(this.items).wrapInner( '<div class="slide"></div>' );
            }
            // set the controls events
            if (this.settings.count > this.settings.showing) {
                // set the control objects
                if ( !$( this.element ).find( '.controls').length ) {
                    this.controls = $( '<div class="controls"></div>' );
                    // append mininav and autoplay to controls
                    this.mininav = $('<div class="mininav"><a class="prev" href="#">Prev</a><span class="indicator"></span><a class="next" href="#">Next</a></div>');
                    this.autoplay = $('<div class="autoplay"><a class="play" href="#">Play</a> <a class="pause" href="#">Pause</a></div>');
                    $( this.controls ).append( this.mininav ).append( this.autoplay );
                    // add class to the wrapper
                    $( this.controls ).addClass( this.settings.controlsPosition );
                    // set the position of the controls
                    if ( this.settings.controlsPosition === 'above' ) {
                        $( this.element ).prepend( this.controls );
                    } else {
                        $( this.element ).append( this.controls );
                    }
                    // set the controls in the layout
                    this.setControls();
                    this.setAutoPlay(!!this._options.autoplay);
                }
            } else {
                // remove controls
                $( this.element ).find( '.controls' ).remove();
                this.setAutoPlay(false);
            }
            // set autoplay
            //this.setAutoTimeout();
        },
        setResize: function () {
            // set resize to true
            this.settings.resize = true;
            this.setParameters();
        },
        setAutoPlay: function ( param ) {
            // set autoplay to param
            this.settings.autoplay = param;
            this.setAutoTimeout();
        },
        setProperties: function () {
            // set items width
            if (this.settings.fluid) {
                this.items.width( this.settings.segment );
            }
            // set list length
            this.list.css({
                width: ( this.settings.count * this.settings.segment ),
                marginLeft: 0
            });
            // set element height
            this.settings.height = this.getElementHeight();
            this.element.height(this.settings.height);
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
            // check if grouping is different to global
            if (showing !== this.settings.showing) {
                // set the layout
                this.settings.showing = showing;
                this.setLayout();
            }
            // set the properties
            this.settings.segment = parseInt($( this.element ).width() * segment, 10);
            this.setProperties();
        },
        setControls: function () {
            var _this = this;
            this.next = $(this.controls).find('.next');
            this.prev = $(this.controls).find('.prev');
            this.play = $(this.controls).find('.play');
            this.pause = $(this.controls).find('.pause');
            this.mininav = $(this.controls).find('.mininav');
            this.indicator = $(this.controls).find('.indicator');
            // set mininav links
            this.items.each(function (index) {
                $(this).attr('id', _this.id + '-' + index);
                _this.indicator.append($('<a href="#' + _this.id + '-' + index + '">' + (index + 1) + '</a>'));
            });
            // set click events
            this.play.bind( 'click', function (e) {
                _this.settings.autoplay = true;
                _this.setAutoTimeout();
                e.preventDefault();
            });
            this.pause.bind( 'click', function (e) {
                _this.settings.autoplay = false;
                _this.setAutoTimeout();
                e.preventDefault();
            });
            this.prev.bind( 'click', function (e) {
                if (_this.click) {
                    _this.click = false;
                    _this.settings.autoplay = false;
                    _this.index -= 1;
                    _this.index = (_this.index < 0) ? _this.settings.count - 1 : _this.index;
                    _this.setAutoTimeout();
                    _this.setIndicator();
                    _this.stepLeft();
                }
                e.preventDefault();
            });
            this.next.bind( 'click', function (e) {
                if (_this.click) {
                    _this.click = false;
                    _this.settings.autoplay = false;
                    _this.index += 1;
                    _this.index = (_this.index > _this.settings.count - 1) ? 0 : _this.index;
                    _this.setAutoTimeout();
                    _this.setIndicator();
                    _this.stepRight();
                }
                e.preventDefault();
            });
            // set nav indicator
            this.indicator.find('a').each(function (index) {
                $(this).bind( 'click', function (e) {
                    if (_this.click) {
                        _this.click = false;
                        if (index < _this.index) {
                            _this.jumpLeft(_this.index, index);
                        } else {
                            _this.jumpRight(_this.index, index);
                        }
                        _this.settings.autoplay = false;
                        _this.index = index;
                        _this.setAutoTimeout();
                        _this.setIndicator();
                    }
                    e.preventDefault();
                });
            });
            // set the indicator active state
            this.setIndicator();
        },
        setIndicator: function () {
            var _this = this;
            this.indicator.find( 'a' ).removeClass(_this.settings.activeClass);
            this.indicator.find( 'a' ).eq(this.index).addClass(_this.settings.activeClass);
        },
        setPlayClass: function () {
            if ( $( this.element ).find( '.controls').length ) {
                var _this = this;
                if (this.settings.autoplay) {
                    this.pause.removeClass(_this.settings.activeClass);
                    this.play.addClass(_this.settings.activeClass);
                } else {
                    this.play.removeClass(_this.settings.activeClass);
                    this.pause.addClass(_this.settings.activeClass);
                }
            }
        },
        setAutoTimeout: function () {
            if (this.settings.autoplay) {
                var _this = this;
                setTimeout(function () {
                    // only run if autoplay is set to true and resize is set to false
                    if (_this.settings.autoplay && !_this.settings.resize) {
                        _this.click = false;
                        _this.index += 1;
                        _this.index = (_this.index > _this.settings.count - 1) ? 0 : _this.index;
                        _this.setIndicator();
                        _this.stepRight();
                    } else {
                        _this.settings.resize = false;
                    }
                    _this.setAutoTimeout();
                }, (_this.settings.timeout * 1000));
            }
            this.setPlayClass();
        },
        /**
         * events
         * */
        jumpLeft: function (a, b) {
            var _this = this;
            if (this.items.length > this.settings.showing) {
                var speed = this.getJumpSpeed(a, b);
                for (var i = a; i > b; i--) {
                    this.list.find( '.section:last-child' ).prependTo(this.list);
                }
                this.list.css( 'left', -((a - b) * this.settings.segment));
                this.list.animate({
                    left: 0
                }, speed, this.settings.easing, function () {
                    _this.list.css( 'left', '' );
                    _this.click = true;
                });
            }
        },
        jumpRight: function (a, b) {
            var _this = this;
            if (this.items.length > this.settings.showing) {
                var speed = this.getJumpSpeed(b, a);
                this.list.animate({
                    left: -((b - a) * this.settings.segment)
                }, speed, this.settings.easing, function () {
                    for (var i = 0; i < (b - a); i++) {
                        _this.list.find( '.section:first-child' ).appendTo(_this.list);
                    }
                    _this.list.css( 'left', '' );
                    _this.click = true;
                });
            }
        },
        stepLeft: function () {
            var _this = this;
            if (this.items.length > this.settings.showing) {
                this.list.find( '.section:last-child' ).prependTo(this.list);
                this.list.css( 'left', -this.settings.segment);
                this.list.animate({
                    left: 0
                }, this.settings.timing, this.settings.easing, function () {
                    _this.list.css( 'left', '' );
                    _this.click = true;
                });
            } else {
                this.list.find( '.section:last-child' ).prependTo(this.list);
                this.list.css( 'left', -this.settings.segment);
                this.list.animate({
                    left: ''
                }, this.settings.timing, this.settings.easing, function () {
                    _this.list.css( 'left', '' );
                    _this.click = true;
                });
            }
        },
        stepRight: function () {
            var _this = this;
            if (this.items.length > this.settings.showing) {
                this.list.animate({
                    left: -this.settings.segment
                }, this.settings.timing, this.settings.easing, function () {
                    _this.list.find( '.section:first-child' ).appendTo(_this.list);
                    _this.list.css( 'left', '' );
                    _this.click = true;
                });
            } else {
                this.list.find( '.section:last-child' ).appendTo(this.list);
                this.list.css( 'left', '' );
                this.list.animate({
                    left: -this.settings.segment
                }, this.settings.timing, this.settings.easing, function () {
                    _this.list.css( 'left', '' );
                    _this.list.find( '.section:first-child' ).appendTo(_this.list);
                    _this.click = true;
                });
            }
        }
    };

    /*
     * Plugin wrapper, preventing against multiple instantiations and
     * return plugin instance.
     */
    $.fn[ pluginName ] = function (options) {
        // if no id set then generate one
        if (!$(this).attr( 'id' )) {
            $(this).attr( 'id', dataKey + '-' + options.key);
        }
        // plugin object
        var plugin = this.data(dataKey);
        // has plugin instantiated ?
        if (plugin instanceof Plugin) {
            // if have options arguments, call plugin.init() again
            if (typeof options !== 'undefined' ) {
                plugin.init(options);
            }
        } else {
            plugin = new Plugin(this, options);
            this.data(dataKey, plugin);
        }
        // return this to allow public methods
        return plugin;
    };

}(jQuery, window, document));