/***
 *      Author: KodingSykosis
 *        Date: 04/26/2013
 *     Version: 1.0
 *     License: GPL v3 (see License.txt or http://www.gnu.org/licenses/)
 * Description: This widget provides a method to manage
 *              the viewport.
 *
 *        Name: jQuery.ui.ViewPort.js
 *
 *    Requires: jQueryUI 1.10.2 or better
 ***/

(function ($) {
    //Workaround for defect in jQueryUI Resizable
    $.ui.resizable.prototype.viewport_FixMe = function () {
        var that = this,
            o = this.options;
        this._handles = $();
        for (key in this.handles) {
            if (this.handles[key].length)
            this._handles = this._handles.add(this.handles[key]);
        }

        this._handles.show();
        
        //Matching axis name
        this._handles.mouseover(function () {
            if (!that.resizing) {
                if (this.className) {
                    axis = this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i);
                }
                //Axis, default = se
                that.axis = axis && axis[1] ? axis[1] : "se";
            }
        });

        //If we want to auto hide the elements
        if (o.autoHide) {
            this._handles.hide();
            $(this.element)
				.addClass("ui-resizable-autohide")
				.mouseenter(function () {
				    if (o.disabled) {
				        return;
				    }
				    $(this).removeClass("ui-resizable-autohide");
				    that._handles.show();
				})
				.mouseleave(function () {
				    if (o.disabled) {
				        return;
				    }
				    if (!that.resizing) {
				        $(this).addClass("ui-resizable-autohide");
				        that._handles.hide();
				    }
				});
        }
        
        if (!$.contains(this.element, this._handles)) {
            var el = this.element;
            
            this.element
                .add(this._handles)
                .wrapAll($('<div>', {
                    'class': 'ui-wrapper'
                }));

            this.wrapper = this.element.parent('.ui-wrapper');
            this.element = this.wrapper;
            this._mouseInit();
            this.element = el;
        } else this._mouseInit();

        //Initialize the mouse interaction
        
    };


    //I didn't extend String to prevent overwriting an existing format implementation
    var string = {
        format: function () {
            var results = arguments[0], re,
                args = Array.prototype.splice.call(arguments, 1);

            if (typeof args[0] == 'object') {
                for (var prop in args[0]) {
                    re = new RegExp('{' + prop + '(?:\!([^\}]+)|\:([^\}]+))?}', 'g');
                    var val = args[0][prop];
                    if (typeof val != 'undefined') {
                        if (typeof val == 'object') val = $.param(val);
                        results = results.replace(re, '$1' + val + '$2');
                    }
                }

                results = results.replace(/{[^}]*}/g, '');
            } else {
                for (var i = 0, len = args.length; i < len; i++) {
                    re = new RegExp('{' + i + '(?:\!([^\}]+)|\:([^\}]+))?}', 'g');
                    results = results.replace(re, '$1' + args[i] + '$2');
                }
            }

            return results;
        },
        firstCapital: function(s) {
            return (s || '').replace(/^(.)/, function(a, l) { return l.toUpperCase(); });
        }
    };

    function buildNode(config) {
        var tagName = config.tagName;
        var conf = $.extend({}, config);
        delete conf.tagName;

        if (conf.cls) {
            config['class'] = config.cls;
            delete config.cls;
        }

        return $(string.format("<{0}>", tagName), conf);
    }

    if (typeof $.defaults === 'undefined') {
        $.defaults = {};
    }

    $.defaults.viewport = {
        region: {
            size: 150,
            collapsable: true,
            resizable: true,
            layout: 'none',
            hidden: false,
            minSize: 40,
            handleSize: 10
        },
        resizeHandles: {
            north: 's',
            south: 'n',
            east: 'w',
            west: 'e'
        },
        handle: {
            'tagName': 'div',
            'class': 'ui-viewport-handle ui-widget-overlay ui-resizable-handle ui-resizable-{direction}'
        },
        regionCSS: {
            
        },
        regionCls: 'ui-widget-content'
    };

    var regionLayout = {
        north: {
            top: 0,
            left: 0,
            right: 0,
            size: 'height',
            dock: 'top',
            direction: 's'
        },
        south: {
            bottom: 0,
            left: 0,
            right: 0,
            size: 'height',
            dock: 'bottom',
            direction: 'n'
        },
        east: {
            right: 0,
            top: 0,
            bottom: 0,
            size: 'width',
            dock: 'right',
            direction: 'w'
        },
        west: {
            left: 0,
            top: 0,
            bottom: 0,
            size: 'width',
            dock: 'left',
            direction: 'e'
        },
        center: {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        }
    };
    
    $.widget('kodingsykosis.viewport', {
        options: {
            north: undefined,
            south: undefined,
            east: undefined,
            west: undefined,
            center: undefined
        },

        _create: function () {
            var o = this.options;
            this.regions = {
                north: this._initRegion(o.north, 'north'),
                south: this._initRegion(o.south, 'south'),
                east: this._initRegion(o.east, 'east'),
                west: this._initRegion(o.west, 'west'),
                center: this._initRegion(o.center, 'center')
            };

            this.element
                .addClass('ui-viewport');
            
            //TODO: Add collapse, resize, and hover fun
            this.reset();
            
            var self = this;
            $.each(this.regions, function(regionName, config) {
                if (!config) return;
                self._initResizable(config);
            });
        },
        
        reset: function (skipRefresh) {
            var self = this,
                idx = {},
                len = 0;
            
            $.each(this.regions, function (regionName, config) {
                if (!config) return;
                
                config.el.addClass('ui-viewport-' + regionName);
                config.name = regionName;
                config.currentSize = config.size;
                
                if (config.hidden) {
                    config.el.hide();
                } else {
                    if (regionName !== 'center') {
                        idx[config.index] = regionName;
                    }
                    
                    config.el.show();
                }
            });
            
            Array.prototype.sort.call(idx, function (a, b) { return a - b; });
            this.index = {};

            $.each(idx, function (prop, value) {
                if (value === 'center') return;
                self.index[len] = value;
                self.regions[value].index = len++;
            });

            this.index[len] = 'center';
            this.regions['center'].index = len++;
            this.index.length = len++;
            
            if (!skipRefresh) {
                this.refresh();
            }
        },

        refresh: function () {
            var self = this;

            self.offsets = {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            };

            $.each(this.index, function (idx, regionName) {
                if (idx === 'lenth') return;
                self.refreshRegion(regionName, true);
            });
        },

        refreshRegion: function (regionName, reset) {
            var config = this.regions[regionName];
            if (!config) return;
            
            this._doRegionLayout(config, reset);
            
            if (config.layout) {
                config.el.layout(config.layout);
            }
        },
        
        collapse: function (regionName) {
            this.toggle(regionName, false);
        },
        
        expand: function (regionName) {
            this.toggle(regionName, true);
        },

        toggle: function(regionName, expand) {
            var config = this.regions[regionName];
            var layout = regionLayout[regionName];
            var css = {};

            if (typeof expand === 'undefined') {
                expand = !config.el.is(':visible');
            }

            if (expand === config.el.is(':visible')) {
                return;
            }

            if (!expand) {
                config.originalSize = config.el[layout.size]();
            } else {
                css[layout.size] = 0;
                config.el
                      .css(css)
                      .show();
            }

            css[layout.size] = expand ? (config.originalSize || config.size) : 0;
            var self = this;
            config.el
                  .animate(css, {
                      step: $.proxy(this._onRegionResizing, this),
                      complete: function () {
                          self._onToggleComplete.call(self, config);
                      }
                  });
        },

        size: function(regionName, size) {
            var config = this.regions[regionName];

            if (size) {
                var layout = regionLayout[config.name];
                config.currentSize = config.el[layout.size]();
                
                this.refresh();
            }

            return config.currentSize;
        },
        
        _doRegionLayout: function(config, reset) {
            var el = config.el,
                layout = regionLayout[config.name],
                css = $.extend(config.cssLayout,
                    reset ? layout : {},
                    $.defaults.viewport.regionCSS);

            if (reset) {
                $.each(this.offsets, function(side, offset) {
                    if (typeof css[side] !== 'undefined') {
                        css[side] = Math.max(css[side], offset) || 0;
                    }
                });

                config.cssLayout = $.extend({}, css);
            }

            if (css.size) {
                css[css.size] = config.currentSize;
                delete css.size;
            }

            if (css.dock) {
                this.offsets[css.dock] += config.currentSize;
            }
            
            if (config.handle != null && config.handle.length > 0) {
                var handleCss = $.extend({}, css);
                handleCss[css.dock] = this.offsets[css.dock];
                handleCss[layout.size] = $.defaults.viewport.region.handleSize;

                config.handle.css(handleCss);
                this.offsets[css.dock] += handleCss[layout.size];
            }
            
            if (css.dock) {
                delete css.dock;
            }
            
            el.css(css)
              .addClass($.defaults.viewport.regionCls)
              .addClass(config.cls);
        },

        _initRegion: function (config, name) {
            if (!config) return null;
            var el;

            if (config === true) {
                config = {};
            }

            if (this._isRegionConfig(config)) {
                el = this._buildRegion(config);
            } else {
                el = $(config);
                config = {};
            }

            config.el = el;
            config = $.extend({ name: name }, $.defaults.viewport.region, config);
            config.orientation = config.size === 'height' ? 'vertical' : 'horizontal';
            
            if (!config.index) {
                config.index = el.index();
            }
            
            if (config.layout && (!$.layouts || !$.layouts[config.layout.render])) {
                config.layout = null;
            }
            
            if (config.name != 'center' && (config.handle == null || config.handle.length == 0)) {
                config.handle = this._buildRegionHandle(config);
                config.el.before(config.handle);
            }
            
            if (config.name == 'center') {
                config.handle = null;
            }

            config.el.data('ViewPort-Region', config.name);
            return config;
        },
        
        _initResizable: function (config) {
            //Initialize the handle
            if (!(config.resizable && this.index) || config.name === 'center') return;
            var layout = regionLayout[config.name];
            var resizeHandle = {};
            var resizeConfig = {
                resize: $.proxy(this._onRegionResizing, this),
                start: $.proxy(this._onRegionResizeStart, this),
                stop: $.proxy(this._onRegionResizeStop, this)
            };

            resizeHandle[$.defaults.viewport.resizeHandles[config.name]] = config.handle;
            resizeConfig.handles = resizeHandle;

            if (config.maxSize) {
                resizeConfig['max' + string.firstCapital(layout.size)] = config.maxSize;
            }
            
            if (config.minSize) {
                resizeConfig['min' + string.firstCapital(layout.size)] = config.minSize;
            }
            
            config.alsoResize = $();

            for (var i = config.index + 1, len = this.index.length; i < len; i++) {
                var region = this.regions[this.index[i]];
                if (config.orientation === region.orientation || region.name === 'center') {
                    config.alsoResize = config.alsoResize.add(region.el);
                }
            }

            // Hack to work around
            // bugfix for http://bugs.jqueryui.com/ticket/1749
            if (config.name === 'south') {
                config.el.data('ViewPort-OrgPosition', {
                    top: config.el.css('top')
                });
            } else if (config.name === 'east') {
                config.el.data('ViewPort-OrgPosition', {
                    left: config.el.css('left')
                });
            }
            
            
            config.el
                .resizable(resizeConfig);
            
            //FixMe: Bug in jQueryUI Resizable
            config.el.resizable('viewport_FixMe');
        },

        _buildRegion: function (config) {
            var css = {
                display: config.hidden ? 'none' : 'block'
            };
            config = $.extend(true, {
                cssLayout: css
            }, $.defaults.viewport.region, config);
            

            if (config.el) {
                return $(config.el);
            }

            var el = buildNode({ tagName: 'div' });
            el.appendTo(this.element);
            
            return el;
        },
        
        _buildRegionHandle: function (config) {
            var domConfig = $.extend({}, $.defaults.viewport.handle);
            var layout = regionLayout[config.name];
            var css = {};
            
            domConfig['class'] = string.format(domConfig['class'], layout);

            var el = buildNode(domConfig);
            css[layout.size] = $.defaults.viewport.region.handleSize;

            return el.uniqueId()
                .css(css)
                .disableSelection()
                .hide();
        },
        
        _isRegionConfig: function (config) {
            return typeof config === "object" &&
                   typeof config.length !== "number";
        },
        
        _onRegionResizing: function (event, ui) {
            this._doResizeHack(ui);
            
            var el = $(ui.originalElement || ui.elem);
            var regionName = el.data('ViewPort-Region');
            var layout = regionLayout[regionName];
            var size = ui.prop === layout.size ? ui.now : ui.size[layout.size];
            
            this.size(regionName, size);
        },
        
        _onRegionResizeStart: function(event, ui) {
            this._doResizeHack(ui);
        },
        
        _onRegionResizeStop: function(event, ui) {
            this._doResizeHack(ui);
        },
        
        _doResizeHack: function (ui) {
            var el = $(ui.originalElement || ui.elem);
            var regionName = el.data('ViewPort-Region');
            if (regionName !== 'south' && regionName !== 'east') return;

            el.css(el.data('ViewPort-OrgPosition'));
        },

        _onToggleComplete: function (config) {
            var layout = regionLayout[config.name],
                el = config.el;

            config.currentSize = el[layout.size]();
            el.resize();

            if (config.currentSize === 0) {
                el.hide();
            }
        }
    });
})(jQuery);