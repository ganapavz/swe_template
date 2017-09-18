/*global jQuery,qg, google*/

// global callback
var getURLParams;

(function(swe,$){
    'use strict';
    var
        //variables
        dataElement = $('#data-url'),
        dataUrl = dataElement.data('url') || '',
        dataTitleColumn = dataElement.data('title-column'),
		dataStrictBounds = dataElement.data('strictbounds')===true?true:(dataElement.data('strictbounds')===false?false:true),
        csvDataElement = $('.view-csv-data'),
        openingHours = ['Mon am','Mon pm','Tues am','Tues pm','Wed am','Wed pm','Thurs am','Thurs pm','Fri am','Fri pm','Sat am','Sat pm','Sun am','Sun pm'],
        title,getDataResult, inputLocationId = 'location',

        //functions
        getData, processTemplate, editDocument, setClassOpeningHours,resizeDynamicContainers,pageSpecFunc
    ;

    editDocument = function(title){
        //edit Title
        if(/{{Title}}/.test(document.title)) {
            document.title = document.title.replace('{{Title}}',title);
        }
        else {
            document.title = title + ' ' + document.title;
        }
        

        //edit meta
        $('meta[name="DCTERMS.title"]').attr('content',$('meta[name="DCTERMS.title"]').attr('content').replace('{{Title}}',title));

        //edit breadcrumb
        if(/{{Title}}/.test($('#breadcrumbs .last-child').text())){
            $('#breadcrumbs .last-child').text($('#breadcrumbs .last-child').text().replace('{{Title}}',title));
        }
        else {
            $('#breadcrumbs .last-child').text(title);
        }

        //edit page heading
        if(/{{Title}}/.test($('#page-heading').text())) {
            $('#page-heading').text($('#page-heading').text().replace('{{Title}}',title));
        }
        else {
            $('#page-heading').text(title);
        }

        //edit side navigation
        //$('#nav-section ul').find('li:first').html($('#nav-section ul').find('li:first').html().replace(/{{Title}}/g,title));
    };

    //Logic that will process template to display results
    processTemplate = function(template,data){
        var eleHtml='';
        var ele = document.createElement('div');
        ele.innerHTML = template;
        $(ele).each(function(){
            var ele = $(this).html();
            if(ele) {
                ele = ele.replace(/\[\[(.*?)\]\]/g, function (matched,key) {
                    var validDataFlag = true; //this flag is set to view id data of mentioned column is available. else it return blank string.
                    $.each(key.match(/\{\{(.*?)\}\}/g),function(k,v){
                        var column = v.match(/{{(.*)}}/).pop().split(':')[1] !== undefined ? v.match(/{{(.*)}}/).pop().split(':')[1] : v.match(/{{(.*)}}/).pop();
                        if (column === 'googleApiKey' || column === 'Closure' || openingHours.indexOf(column)>-1 || column === 'staticmap') {
                            validDataFlag = true;
                        }
                        else if(data[column] === undefined || data[column].trim().length === 0) {
                            validDataFlag = false;
                        }
                    });
                    if(validDataFlag) {
                        var html = swe.template.process( key, data );
                        return /\{\{(.*?)\}\}/.test(html) ? '' : html;
                    }
                    else {
                        return '';
                    }
                });
                eleHtml+=ele;
            }
        });
        return eleHtml;
    };

    setClassOpeningHours = function(){
        var d = new Date(),
            n = d.getDay(),
            days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

        $.each($('#view-opening-hours tr'),function(){
            if($(this).find('th').first().text() === days[n]){
                $(this).addClass('today');
            }
            else if($(this).find('th').first().text() === days[(n + 1) % 7]) {
                $(this).addClass('tomorrow');
            }
        });
    };

    getData = function(){
        var
            resourceId = dataUrl.split('resource/')[1],
            domain = dataUrl.indexOf('staging.data.qld.gov.au')>=0 ? 'staging.data.qld.gov.au' : 'data.qld.gov.au',
            whereQuery='',
            query = ''
        ;

        $.each($.url().param(),function(k,v){
            if(k!=='title') {
                whereQuery+='AND upper("'+k+'") LIKE upper(\'%'+v.replace(/'/g, '\'\'')+'%\' ) ';
            }
        });

        query = 'SELECT * from "'+resourceId+'" WHERE 1=1 AND ( upper("'+dataTitleColumn+'") LIKE upper(\''+title.replace(/'/g, '\'\'')+'\' ) '+whereQuery+' )';

        // load json data
        qg.data.get(domain, query, {
            cache: !0,
            successCallback: function (data) {
                if (data.result.records.length > 0) {
                    getDataResult = data.result.records;
                    $.each(csvDataElement,function(){
                        $(this).html(processTemplate($(this).html(),getDataResult[0]));
                        $(this).removeClass('visuallyhidden');
                        resizeDynamicContainers($(this));
                    });
                    setClassOpeningHours();
                    pageSpecFunc();
                    if($('#view-opening-hours').find('td').filter(function () { return $(this).text() === 'Closed'; }).length===14){$('#view-opening-hours').remove();}   //removes table if all values are 'Closed'
                    // processTemplate($('#nav-section ul').html(),getDataResult[0],'#nav-section ul');
                }
                else {
                    console.log('Data not found');
                }
            }
        });
    };

    getURLParams = function(){
        $.each(window.location.search.split('&'), function () {
            if (this.indexOf('title') > -1) {
                title = decodeURI(this.split('=')[1]).replace(/\+/g, ' ');
            }
            if(typeof title !== undefined) {
                editDocument(title);
                getData();
            }
            else {
                editDocument('');
            }
        });
        
    };

    //Adjusts the height of dynamically created containers
    resizeDynamicContainers = function (container) {
        setTimeout(function(){
            container.trigger( 'x-height-change' );
        }, 1000);
    };

    //page specific functionalities will be written here
    pageSpecFunc = function () {
        if(typeof qg.swe.customMapScript !== undefined && typeof qg.swe.customMapScript === 'function') {
            qg.swe.customMapScript();
        }
    };

    $(window).load(function(){
        var input = document.getElementById(inputLocationId);
        if(input){
            var qldBounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(-29,138.0578426),
                new google.maps.LatLng(-9.9339, 153.63831));

            var options = {
                bounds:qldBounds,
                strictBounds: dataStrictBounds,
                types: ['geocode']
            };
            var autocomplete = new google.maps.places.Autocomplete(input, options);
            autocomplete.getPlace();
			if(dataElement.data('location')!==undefined){
				$(input).on('focus',function(){
					var patt = new RegExp(dataElement.data('location')+'$');
					if(!patt.test(input.value)){
						input.value+=dataElement.data('location');
					}
					setTimeout(function() {
						$(input).get(0).setSelectionRange(0, 0);
					}, 1);
				});
			}
        }
        else {
            getURLParams();
        }
    });

    

    // getURLParams();
})(qg.swe,jQuery);

getURLParams();
