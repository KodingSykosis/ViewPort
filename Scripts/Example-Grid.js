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
                el: '#center',
                layout: {
                    render: 'row',
                    height: 32,
                    margin: 2
                }
            },
            east: {
                index: 3,
                el: '#east',
                resizable: true,
            }
        });

        $('.row').layout('column');
    });
})(jQuery);