function requestShareInfo() {
    console.log("sending 'send_info' message from popup.js");
    self.postMessage({'cmd': 'send_info'});
}

function receiveHTMLMessage(event) {
    if (event.origin !== "https://www.reader2000.com" && event.origin !== "http://www.reader2000.com") {
        return;
    }
    // now just pass it...
    self.postMessage(event.data);
}

self.port.on('populate_share', function(message) {
    console.log("popup.js - populate_share");
    message.domain = location.origin;
    let contentWindow = $("#__nir-sharebox").find("iframe")[0].contentWindow;
    contentWindow.postMessage(message, self.options.protocol + '//www.reader2000.com');
});

$(document).ready(function() {
    window.addEventListener("message", receiveHTMLMessage, false)
    let bookmarketurl = self.options.protocol + '//www.reader2000.com/shares/new?bookmarklet=true';
    console.log("bookmarkleturl: %s", bookmarketurl);
    let $iframe = $("iframe.r2k-iframe");
    $iframe.attr("src", bookmarketurl);
    $iframe.on( "load", function(event) {
        requestShareInfo();
        let contentWindow = $("#__nir-sharebox").find("iframe")[0].contentWindow;
        contentWindow.addEventListener("submit", function(event) {
            console.log("form is submitting");
        });
        contentWindow.addEventListener("click", function(event) {
            console.log("click! ", event);
        });
    });

});