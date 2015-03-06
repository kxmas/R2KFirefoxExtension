var { ActionButton } = require('sdk/ui/button/action');
var self = require("sdk/self");
var data = self.data;


var button = ActionButton({
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
    let tabProtocol = require("sdk/url").URL(activeTab.url).protocol;
    var panel = require("sdk/panel").Panel({
        width: 540,
        height: 514,
        contextMenu: false,
        contentURL: data.url("popup.html"),
        contentScriptFile: [data.url("jquery.js"), data.url("popup.js")],
        contentScriptOptions: {"protocol" : tabProtocol },
        contentScriptWhen: "ready",
        contentStyleFile: data.url("popup.css"),

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
                    destroySharebox(activeTab);
                    break;
                default:
            }
        }
    });
    activeTab.on('pageshow', function(tab) {
        "use strict";
        destroySharebox(tab);
    });
    return panel;
}

function destroySharebox(tab) {
    "use strict";
    if (hasShareBox(tab)) {
        console.log("destroying sharebox");
        tab.sharebox.destroy();
        tab.sharebox = null;
    }
}

function hasShareBox(tab) {
    return (typeof(tab.sharebox) !== 'undefined' && tab.sharebox !== null);
}

function cmdFromMessage(message) {
    return (message.cmd ? message.cmd : message);
}

function handleClick(state) {
    console.log("state: ", state);
    var activeTab = require("sdk/tabs").activeTab;
    if (activeTab.url.indexOf('http') === -1) {
        return;
    }
    var tabWorker = activeTab.attach({
        contentScriptFile: [ data.url("jquery.js"), data.url("injection.js") ],
        contentScriptOptions: {  },
        onError: function(error) {
            console.log("main.js - from tab, got error: ", error);
        },
        onMessage: function(message) {
            let command = cmdFromMessage(message);
            if (command === "populate_share" && hasShareBox(activeTab)) {
                activeTab.sharebox.port.emit("populate_share", message);
            }
        }
    });

    if (!hasShareBox(activeTab)) {
        activeTab.sharebox = newShareboxPanel(activeTab, tabWorker);
    }
    activeTab.sharebox.show({
        position: button
    });
}