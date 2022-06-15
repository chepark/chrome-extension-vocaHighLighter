class FrontEnd {
  constructor() {
    // variables
    this.appEnabled;
    this.selectedText = '';
    this.targetNode;
    this.observer;

    //events
    window.addEventListener('mouseup', () => {
      if (!this.appEnabled) return;
      else {
        this.handleSelection();
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.className == 'highlighted_closeBtn') {
        e.preventDefault();
        let word = e.target.parentNode.childNodes[0].nodeValue.toLowerCase();
        removeWord(word); // remove the word from localStorage
      }
    });

    chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
      const { url, ping, saveSelectedText } = req;

      if (url) {
        this.setInitStatus(url);
      }

      if (ping) {
        sendResponse({ pong: true });
      }

      if (saveSelectedText) {
        if (this.handleSelection()) {
          isThereMyLists(this.selectedText);
        }
      }

      return true;
    });

    chrome.storage.onChanged.addListener((changes) => {
      const appStatus = changes.appEnabled;
      const myWordStatus = changes.myWords;

      if (appStatus) {
        this.appEnabled = appStatus.newValue;
        switch (this.appEnabled) {
          case true:
            myHighLighter.remove(document.body);
            this.executeHighLighter();
            break;
          case false:
            myHighLighter.remove(document.body);
            break;
          default:
            null;
        }
      } else if (!appStatus) null;

      if (this.appEnabled && myWordStatus.newValue) {
        myHighLighter.remove(document.body);
        this.executeHighLighter();
      }
    });
  }

  executeHighLighter = () => {
    chrome.storage.local.get(['myWords', 'wordColors'], (res) => {
      const { myWords, wordColors } = res;

      if (myWords) {
        const wordsArr = Object.keys(myWords);
        myHighLighter.apply(document.body, wordsArr, myWords, wordColors);
      } else if (!myWords) {
        return;
      }
    });
  };

  setInitStatus = (url) => {
    chrome.storage.sync.get(['appEnabled'], (res) => {
      this.appEnabled = res.appEnabled;

      if (this.appEnabled) {
        switch (url) {
          case 'https://www.facebook.com/':
            setTimeout(this.executeHighLighter, 3000);
            this.targetNode = document.querySelector('div[role="feed"]');
            this.changeObserver(this.targetNode);
            break;
          case 'https://www.youtube.com/':
            setTimeout(this.executeHighLighter, 3000);
            break;
          default:
            this.executeHighLighter();
        }
      }
    });
  };

  handleSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().toLowerCase().trim();
    if (selectedText.length > 0) {
      this.selectedText = selectedText;
    }
    return selectedText.length;
  };

  changeObserver = (targetNode) => {
    const config = {
      attributes: false,
      childList: true,
      chracterData: false,
      subtree: false,
    };

    this.observer = new MutationObserver((mutations) => {
      for (let i = 0; i < mutations.length; i++) {
        let type = mutations[i].type;
        if (
          type == 'childList' &&
          mutations[i].addedNodes &&
          this.appEnabled == true
        ) {
          let node = Array.from(mutations[i].addedNodes);

          chrome.storage.local.get(['myWords', 'wordColors'], (res) => {
            const { myWords, wordColors } = res;
            const wordsArr = Object.keys(myWords);

            if (node[0] == undefined) {
              null;
            } else if (node[0]) {
              myHighLighter.apply(node[0], wordsArr, myWords, wordColors);
            }
          });
        }
      }
    });

    this.observer.observe(targetNode, config);
  };
}

window.frontEnd = new FrontEnd();
