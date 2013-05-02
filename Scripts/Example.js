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
                index: 3,
                el: '#center'
            }
        });
    });
})(jQuery);