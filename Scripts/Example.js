(function ($) {
    $(function () {
        $('body').viewport({
            north: {
                index: 1,
                el: '#north',
                size: 75,
                maxSize: 200,
                minSize: 40,
                resizable: true
            },
            west: {
                index: 2,
                el: '#west',
                resizable: true
            },
            center: {
                el: '#center'
            },
            south: {
                index: 3,
                el: '#south',
                size: 75,
                maxSize: 200,
                minSize: 40,
                resizable: true
            },
            east: {
                index: 4,
                el: '#east',
                resizable: true,
                size: 800,
                maxSize: 800
            }
        });
    });
})(jQuery);