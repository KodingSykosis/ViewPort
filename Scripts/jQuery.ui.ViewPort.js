/***
 *      Author: KodingSykosis
 *        Date: 04/26/2013
 *     Version: 1.0
 * Description: This widget provides a method to manage
 *              the viewport.
 *
 *        Name: jQuery.ui.ViewPort.js
 *
 *    Requires: jQueryUI 1.10.2 or better
 ***/

(function ($) {
    //I didn't extend String to prevent overwriting an existing format implementation
    var string = {
        format: function () {
            var results = arguments[0], re;

            if (typeof arguments[1] == 'object') {
                for (var prop in arguments[1]) {
                    re = new RegExp('{' + prop + '(?:\!([^\}]+)|\:([^\}]+))?}', 'g');
                    var val = arguments[1][prop];
                    if (typeof val != 'undefined') {
                        if (typeof val == 'object') val = $.param(val);
                        results = results.replace(re, '$1' + val + '$2');
                    }
                }

                results = results.replace(/{[^}]*}/g, '');
            } else {
                for (var i = 1, len = arguments.length; i < len; i++) {
                    re = new RegExp('{' + i + '(?:\!([^\}]+)|\:([^\}]+))?}', 'g');
                    results = results.replace(re, '$1' + arguments[i] + '$2');
                }
            }

            return results;
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
            resizable: false,
            layout: 'none',
            hidden: false,
            handle: ''
        }
    };

    var regionLayout = {
        north: {
            top: 0,
            left: 0,
            right: 0,
            size: 'height',
            position: 'top'
        },
        south: {
            bottom: 0,
            left: 0,
            right: 0,
            size: 'height',
            position: 'bottom'
        },
        east: {
            right: 0,
            top: 0,
            bottom: 0,
            size: 'width',
            position: 'right'
        },
        west: {
            left: 0,
            top: 0,
            bottom: 0,
            size: 'width',
            position: 'left'
        },
        center: {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        }
    };

    var handleTemplates = {
        bar: {
            cls: 'ui-viewport-{name}-handle-bar',
            size: 4,
            icon: 'ui-icon-grip-solid-{orientation}'
        },
        button: {
            cls: 'ui-viewport-{name}-handle-button',
            size: 0,
            icon: 'ui-icon-carot-1-{name}'
        }
    };

    $.widget('ui.viewport', {
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
        },
        
        reset: function () {
            var idx = {};
            
            $.each(this.regions, function (regionName, config) {
                if (!config) return;
                
                config.el.addClass('ui-viewport-' + regionName);
                config.name = regionName;
                config.currentSize = config.size;
                
                if (config.hidden) {
                    config.el.hide();
                } else {
                    idx[config.index] = regionName;
                    config.el.show();
                }
            });
            
            Array.prototype.sort.call(idx, function (a, b) { return a - b; });
            this.index = idx;
            this.refresh();
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
                self.refreshRegion(regionName, true);
            });
        },

        refreshRegion: function (regionName, reset) {
            var config = this.regions[regionName];
            if (!config) return;
            

            console.debug('refreshing region', regionName, config);
            this._doRegionLayout(config, reset);
            
            if (config.layout) {
                console.debug('triggering layout', config.layout, 'for region', regionName);
                config.el[config.layout]();
            }
        },
        
        _doRegionLayout: function(config, reset) {
            var el = config.el,
                css = $.extend(config.cssLayout,
                    reset ? 
                    regionLayout[config.name] :
                        {});

            if (reset) {
                $.each(this.offsets, function(side, offset) {
                    if (typeof css[side] !== 'undefined') {
                        console.log('Updating side', side, css[side], offset);
                        css[side] = Math.max(css[side], offset) || 0;
                    }
                });

                config.cssLayout = $.extend({}, css);
            }

            console.debug('Applying layout to region', config.name, config.el, css);
            
            if (css.size) {
                css[css.size] = config.currentSize;
                delete css.size;
            }

            if (css.position) {
                this.offsets[css.position] += config.currentSize;
                delete css.position;
            }
            
            console.log('Offsets updated', this.offsets);
            
            el.css(css);
        },

        _initRegion: function (config, name) {
            if (!config) return null;
            var el;

            if (this._isRegionConfig(config)) {
                el = this._buildRegion(config);
            } else {
                el = $(config);
                config = {};
            }

            config.el = el;
            config = $.extend({}, $.defaults.viewport.region, config);
            config.orientation = config.size === 'height' ? 'vertical' : 'horizontal';
            
            if (!config.index) {
                config.index = el.index();
            }
            
            if (!$.fn[config.layout]) {
                config.layout = null;
            }

            //config.el.after(content.handle);

            console.log('Region', name, config);

            return config;
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
            el.appendTo(this.Element);
            
            return el;
        },
        
        _createHandle: function (regionConfig) {
            var config,
                templateName = regionConfig.handle;
            
            if (typeof templateName === "string") {
                config = handleTemplates[templateName];
            } else {
                config = templateName;
            }

            var nodeConfig = {
                tagName: 'div',
                cls: string.format(config.cls, regionConfig)
            };
            
            if (config.icon) {
                nodeConfig.append = [
                    buildNode({
                        tagName: 'span',
                        cls: 'ui-icon ' + config.icon
                    })
                ];
            }

            regionConfig.handle = buildNode(nodeConfig);
        },

        _isRegionConfig: function (config) {
            return typeof config === "object" &&
                   typeof config.length !== "number";
        }
    });
})(jQuery);