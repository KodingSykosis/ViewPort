(function ($) {
    function createInstance(element) {
        var cls = function () { };
        cls.prototype = prototype;

        cls = new cls();
        cls.element = element;

        $(element).data('layout', cls);
        return cls;
    }

    $.extend({
        layouts: (function () {
            return {
                extend: $.extend
            };
        })()
    });

    var prototype = {
        init: function(config) {
            $.extend(this, {
                render: $.layouts[config.render || 'row'],
                config: config
            });

            this.element
                .on({
                    resize: $.proxy(this._onResize, this)
                });

            this.refresh();
            return this.element;
        },
        
        refresh: function() {
            this.render
                .doLayout(this.element, this.config);
        },
        
        render: function(name) {
            if (typeof name !== 'undefined' && $.layouts[name]) {
                this.render = $.layouts[name];
                this.refresh();
            }

            return this.render;
        },
        
        _onResize: function(event) {
            this.refresh();
        }
    };
    
    $.fn.layout = function (method) {
        var cls = $(this).data('layout');
        var initial = false;
        
        if (typeof cls === 'undefined') {
            cls = createInstance(this);
            initial = true;
        }

        // Method calling logic
        if (cls[method]) {
            return cls[method].apply(cls, Array.prototype.slice.call(arguments, 1));
        } else if (cls && (typeof method === 'object' || !method)) {
            if (initial) {
                return cls.init.apply(cls, arguments);
            } else {
                cls.refresh();
            }
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.layout');
        }

        return this;

    };
})(jQuery);