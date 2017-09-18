/****************************************************
     Author: Brian J Clifton
     Url: http://www.advanced-web-metrics.com/scripts
     This script is free to use as long as this info is left in
     
     Combined script for tracking external links, file downloads and mailto links
     
     All scripts presented have been tested and validated by the author and are believed to be correct
     as of the date of publication or posting. The Google Analytics software on which they depend is 
     subject to change, however; and therefore no warranty is expressed or implied that they will
     work as described in the future. Always check the most current Google Analytics documentation.
     Thanks to Nick Mikailovski (Google) for intitial discussions & Holger Tempel from webalytics.de
     for pointing out the original flaw of doing this in IE.
    
    ****************************
    
     Hacked on and probably mangled by Ed Cramer, summer 2010
     captthud@captthud.net
     The original code used the "traditional" tracking code snippet, and I'd prefer the "asyncrhonous"
     code because it's supposed to be faster. I've changed a lot of the formatting and I think
     I've removed the bug fix for IE6/7.
     
****************************************************/
// Only links written to the page (already in the DOM) will be tagged
// This version is for ga.js (last updated Jan 15th 2009)

function addLinkerEvents() {
    var as = document.getElementsByTagName("a");
    var extTrack = ["www.business.qld.gov.au"];
    // List of local sites that should not be treated as an outbound link. Include at least your own domain here
    
    var extDoc = [".doc",".xls",".exe",".zip",".pdf",".ppt",".pps"];
    //List of file extensions on your site. Add/edit as you require
    
    /*If you edit no further below this line, Top Content will report as follows:
        /ext/url-of-external-site
        /downloads/filename
        /mailto/email-address-clicked
        
        Haha, like I can let things be - time to break stuff! (Ed)
    */
    
    for(var i=0; i<as.length; i++) 
    {
        var flag = 0;
        var tmp = as[i].getAttribute("onclick");
        /* I removed this because I don't know what it's for. Classy, right? (Ed)
        
        // IE6-IE7 fix (null values error) with thanks to Julien Bissonnette for this
        if (tmp != null) 
        {
          tmp = String(tmp);
          if (tmp.indexOf('urchinTracker') > -1 || tmp.indexOf('_trackPageview') > -1) 
            continue;
        }
        */
        
        // Tracking outbound links off site - not the GATC
        for (var j=0; j<extTrack.length; j++) 
        {                    
            if (as[i].href.indexOf(extTrack[j]) == -1 && as[i].href.indexOf('google-analytics.com') == -1 ) 
            {
                flag++;
            }
        }
        
        if (flag == extTrack.length && as[i].href.indexOf("mailto:") == -1)
        {
            as[i].onclick = function()
            { 
                var splitResult = this.href.split("//");                //removed... Looks like it's part of the IE fix from before (Ed)
                _gaq.push(['_trackPageview', '/ext/' +splitResult[1]]); //+ ";" +((tmp != null) ? tmp+";" : "");
            };
                //alert(as[i] +"  ext/" +splitResult[1])
        }        
        // Tracking electronic documents - doc, xls, pdf, exe, zip
        for (var j=0; j<extDoc.length; j++) 
        {
            if (as[i].href.indexOf(extTrack[0]) != -1 && as[i].href.indexOf(extDoc[j]) != -1) 
            {
                as[i].onclick = function()
                { 
                    var splitResult = this.href.split(extTrack[0]);                    //removed... Looks like it's part of the IE fix from before (Ed)
                    _gaq.push(['_trackPageview', '/docs/' + splitResult[1]]); //+ ";" +((tmp != null) ? tmp+";" : "");
                }
                //alert(as[i] +"  /downloads/" +splitResult[1])
                break;
            }
        }
        // added to track mailto links 23-Oct-2007
        // updated 31-Oct-2008 to remove break command - thanks to Victor Geerdink for spotting this
        if (as[i].href.indexOf("mailto:") != -1) 
        {
            as[i].onclick = function()
            {
                var splitResult = this.href.split(":");                        //removed... Looks like it's part of the IE fix from before (Ed)
                _gaq.push(['_trackPageview', '/mailto/' +splitResult[1]]); //+ ";"+((tmp != null) ? tmp+";" : "");
            }
            //alert(as[i] +"  mailto/" +splitResult[1])
        }
    }
}