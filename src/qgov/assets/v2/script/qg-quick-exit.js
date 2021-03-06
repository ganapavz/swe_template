(function ($) {
    'use strict';
    var quickExit = {
        el : '#quick-exit',
        init : function () {
            $(this.el).empty().append(this.template);
            this.methods();
        },
        template : '<header><strong>Quick exit to</strong></header><ul><li><a target="_top" data-accesskey="Esc" href="http://www.abc.net.au/tv/epg/#/" title="ABC"><img src="/assets/v2/images/quick-exit/abc-bw.png" alt="ABC"></a></li><li><a target="_top" href="https://www.facebook.com/" title="Facebook"><img src="/assets/v2/images/quick-exit/facebook-bw.png" alt="Facebook"></a></li></ul><footer><strong>or press \'Esc\'</strong></footer>',
        methods : function () {
            var quickExitLinks = $(this.el).find('a');
            var escLink = $(this.el).find('a[data-accesskey="Esc"]').attr('href');
            // action on esc key press
            $(document).keydown(function(e) {
                if(e.keyCode === 27){
                    window.location.replace(escLink);
                    return false;
                }
            });

            // clicking on the quick exit block
            $(document).on('click', this.el, function () {
                window.location.replace(escLink);
            });

            //clicking on the links inside the quick exit block
            quickExitLinks.click(function (e) {
                e.stopPropagation();
                e.preventDefault();
                window.location.replace($(this).attr('href'));
            });
        }
    };
    quickExit.init();
}(jQuery));