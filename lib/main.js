var { ToggleButton } = require('sdk/ui/button/toggle');
var tabs = require("sdk/tabs");
var pageWorkers = require("sdk/page-worker");
var self = require("sdk/self");
var urls = require("sdk/url");
var data = self.data;


var sharebox;

var button = ToggleButton({
    id: "note-in-r2k",
    label: "Note in R2K",
    icon: {
        "16": "./icons/icon_16.png",
        "32": "./icons/icon_32.png",
        "64": "./icons/icon_64.png",
        "128": "./icons/icon_128.png"
    },
    onClick: handleClick
});

function newShareboxPanel(activeTab, tabWorker) {
    let tabProtocol = urls.URL(activeTab.url).protocol;
    var panel = require("sdk/panel").Panel({
        width: 540,
        height: 514,
        contextMenu: false,
        contentURL: data.url("popup.html"),
        contentScriptFile: [data.url("jquery.js"), data.url("popup.js")],
        contentScriptOptions: {"protocol" : tabProtocol },
        contentScriptWhen: "ready",
        contentStyleFile: data.url("popup.css"),
        onShow: function (event) {
            console.log("showing sharebox");
            button.state('window', {checked: true});
        },
        onHide: function (event) {
            console.log("hiding sharebox");
            button.state('window', {checked: false});
        },
        onMessage: function(message) {
            let command = cmdFromMessage(message);

            console.log("cmd: " + command);
            switch (command) {
                case "send_info":
                    tabWorker.port.emit('send_info', message);
                    break;
                case "populate_share":
                    panel.port.emit("populate_share", message);
                    break;
                case "remove_sharebox":
                case "hide_sharebox":
                    destroySharebox();
                    break;
                default:
                    break;
            }
        }
    });
    activeTab.on('pageshow', function(tab) {
        "use strict";
        destroySharebox();
    });
    return panel;
}

function destroySharebox() {
    "use strict";
    if (typeof(sharebox) !== 'undefined' && sharebox !== null) {
        console.log("destroying sharebox");
        sharebox.destroy();
        sharebox = null;
    }
}

function cmdFromMessage(message) {
    return (message.cmd ? message.cmd : message);
}

function handleClick(state) {
    console.log("state: %O", state);
    var activeTab = tabs.activeTab;
    if (activeTab.url.indexOf('http') === -1) {
        button.state('window', {checked: false});
        return;
    }
    var tabWorker = activeTab.attach({
        contentScriptFile: [ data.url("jquery.js"), data.url("injection.js") ],
        contentScriptOptions: {  },
        onError: function(error) {
            console.log("main.js - from tab, got error: %s", error);
        },
        onMessage: function(message) {
            let command = cmdFromMessage(message);
            if (command === "populate_share") {
                sharebox.port.emit("populate_share", message);
            }
        }
    });

    if (!sharebox) {
        sharebox = newShareboxPanel(activeTab, tabWorker);
    }
    sharebox.show({
        position: button
    });
}