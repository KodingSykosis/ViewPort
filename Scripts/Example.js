(function ($) {
    $(function () {
        $('body').viewport({
            north: {
                index: 1,
                el: '#north',
                size: 75
            },
            west: {
                index: 2,
                el: '#west'
            },
            center: {
                index: 3,
                el: '#center'
            }
        });
    });
})(jQuery);