class Background {
  constructor() {
    // global variables
    this.selectedText = "";
    this.activeTabId;
    this.netWorkCounter = 0;
    this.oldOrigin = "";
    this.activeUrl = "";

    chrome.contextMenus.create({
      title: "Voca-Highlighter",
      contexts: ["selection"],
      id: "parent",
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      this.sendMsgToFront(tab.id);
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.activeUrl = changeInfo.url || tab.url;

      chrome.tabs.sendMessage(tabId, { url: this.activeUrl });
    });
  }

  sendMsgToFront = (tabId) => {
    chrome.tabs.sendMessage(tabId, { ping: true }, (response) => {
      if (response && response.pong) {
        chrome.tabs.sendMessage(tabId, { saveSelectedText: true });
      } else {
        // No listener on the other end
        // Injecting script programmatically
        chrome.scripting.executeScript(
          tabId,
          { file: "frontEnd/frontEnd.js" },
          () => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              throw Error("Unable to inject script into tab " + tabId);
            }
            // OK, now it's injected and ready
            this.highLighterMsg(tabId);
          }
        );
      }
    });
  };

  highLighterMsg = (tabId) => {
    chrome.tabs.sendMessage(tabId, { highLighter: true });
  };
}

new Background();
