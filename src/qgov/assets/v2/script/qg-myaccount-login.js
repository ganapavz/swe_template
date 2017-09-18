/*global requirejs,qg */

function myAccountLogin(){
    'use strict';
    var d1 = $.Deferred(),
        d2 = $.Deferred(),
        d3 = $.Deferred();
    // lazy load css
    function lazyStyle( url ) {
        $( 'head' ).append( '<link rel="stylesheet" href="' + url + '" />' );
    }



    $.getScript('https://cdn.auth0.com/js/auth0/8.3.0/auth0.min.js').done(function(){d1.resolve();console.log('auth0 loaded');});
    $.getScript('https://cdn.auth0.com/w2/auth0-7.6.1.min.js').done(function(){d2.resolve();console.log('auth0-7.6.1 loaded');});
    $.getScript('https://cidm-neo.sandpit.test-services.qld.gov.au/lock/DEV/develop/lock.js').done(function(){d3.resolve();console.log('lock loaded');});

    lazyStyle('https://cidm-neo.sandpit.test-services.qld.gov.au/DEV/CIDM-NEO/master/css/cidm-neo.css');
    lazyStyle('https://cidm-neo.sandpit.test-services.qld.gov.au/DEV/CIDM-NEO/master/css/cidm-profile.css');

    $.when(d1, d2, d3).then(function(){
        console.log('ds resolved');
        $.getScript('https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.2/require.min.js')
            .done(function(){
                var config = fetchConfig();
                if(config !== undefined) {
                    requirejs(['https://cidm-neo.sandpit.test-services.qld.gov.au/DEV/CIDM-NEO/master/js/cidm-loader.js'], function() {
                        requirejs(['cidm-neo', 'cidm-utils'], function() {
                            $(document).ready(function() {
                                $.qgcidm.initialise({
                                    home: config.home,
                                    domain: config.domain,
                                    clientID: config.clientID,
                                    webtaskHome: config.webtaskHome,
                                    level: 'Level_1',
                                    wrapped: true,
                                    // returnTo: location.protocol + '//' + location.host + config.returnTo
                                    returnTo: config.returnTo
                                });

                                $('#qg-avatar')
                                    .avatar()
                                    .onLogin(function() {
                                        console.log('on login');
                                    })
                                    .onLogout(function() {
                                        console.log('on logout');
                                    })
                                ;

                                $.qgcidm.enable();
                            });
                        });
                    });
                } else {
                    console.error('Cidm Neo Config unavailable');
                }
            })
            .fail(function(err){
                console.log(err);
            });
    });

    function fetchConfig(){
        var config = {};
        if(qg.swe.cidmNeoConfig.prdDomains.indexOf(window.location.hostname)>=0) {
            config.home = qg.swe.cidmNeoConfig.prdConfig.home;
            config.domain = qg.swe.cidmNeoConfig.prdConfig.domain;
            config.webtaskHome = qg.swe.cidmNeoConfig.prdConfig.webtaskHome;
            config.clientID = qg.swe.cidmNeoConfig.prdConfig.clientID;
            config.returnTo = qg.swe.cidmNeoConfig.prdConfig.returnTo || window.location.href;
        } else if(qg.swe.cidmNeoConfig.uatDomains.indexOf(window.location.hostname)>=0) {
            config.home = qg.swe.cidmNeoConfig.uatConfig.home;
            config.domain = qg.swe.cidmNeoConfig.uatConfig.domain;
            config.webtaskHome = qg.swe.cidmNeoConfig.uatConfig.webtaskHome;
            config.clientID = qg.swe.cidmNeoConfig.uatConfig.clientID;
            config.returnTo = qg.swe.cidmNeoConfig.uatConfig.returnTo || window.location.href;
        } else if(qg.swe.cidmNeoConfig.tstDomains.indexOf(window.location.hostname)>=0) {
            config.home = qg.swe.cidmNeoConfig.tstConfig.home;
            config.domain = qg.swe.cidmNeoConfig.tstConfig.domain;
            config.webtaskHome = qg.swe.cidmNeoConfig.tstConfig.webtaskHome;
            config.clientID = qg.swe.cidmNeoConfig.tstConfig.clientID;
            config.returnTo = qg.swe.cidmNeoConfig.tstConfig.returnTo || window.location.href;
        } else if(qg.swe.cidmNeoConfig.devDomains.indexOf(window.location.hostname)>=0) {
            config.home = qg.swe.cidmNeoConfig.devConfig.home;
            config.domain = qg.swe.cidmNeoConfig.devConfig.domain;
            config.webtaskHome = qg.swe.cidmNeoConfig.devConfig.webtaskHome;
            config.clientID = qg.swe.cidmNeoConfig.devConfig.clientID;
            config.returnTo = qg.swe.cidmNeoConfig.devConfig.returnTo || window.location.href;
        } else {
            console.error('Unlisted Domain');
        }
        
        return config;
        
    }
}
myAccountLogin();