function requestShareInfo(event) {
    console.log("sending 'send_info' message from popup.js. event: ", event);
    try {
        self.postMessage({'cmd': 'send_info'});
    } catch (postMessageErr) {
        console.log("caught error posting message to iframe. ", postMessageErr);
    }
}

function receiveHTMLMessage(event) {
    if (event.origin !== "https://www.reader2000.com" && event.origin !== "http://www.reader2000.com") {
        return;
    }
    if (event.data === "hide_sharebox") {
        var iframe = $("#__nir-sharebox").find("iframe.r2k-iframe")[0];
        iframe.removeEventListener("load", requestShareInfo, false);
        var iframeOnPageLoad = function(pageLoadEvent) {
            console.log("pageLoadEvent: ", pageLoadEvent);
            iframe.removeEventListener("load", iframeOnPageLoad, false);
            self.postMessage(event.data);
        }
        iframe.addEventListener("load", iframeOnPageLoad, false);
    } else {
        self.postMessage(event.data);
    }
}

self.port.on('populate_share', function(message) {
    console.log("popup.js - populate_share");
    message.domain = location.origin;
    let contentWindow = $("#__nir-sharebox").find("iframe")[0].contentWindow;
    contentWindow.postMessage(message, self.options.protocol + '//www.reader2000.com');
});

$(document).ready(function() {
    window.addEventListener("message", receiveHTMLMessage, false);
    let bookmarketurl = self.options.protocol + '//www.reader2000.com/shares/new?bookmarklet=true';
    console.log("bookmarkleturl: ", bookmarketurl);
    let $iframe = $("iframe.r2k-iframe");
    $iframe.attr("src", bookmarketurl);
    $iframe.get()[0].addEventListener("load", requestShareInfo, false);
});