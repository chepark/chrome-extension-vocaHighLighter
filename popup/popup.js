const appBtn = document.querySelector("input[name=appBtn]");
const myListForm = document.getElementById("main_form");
const removeBtn = document.getElementById("removeBtn");
const syncStorage = chrome.storage.sync;
const localStorage = chrome.storage.local;

const initApp = () => {
  syncStorage.get("appEnabled", (res) => {
    const { appEnabled } = res;

    if (appEnabled) {
      appBtn.checked = appEnabled;
    } else if (!appEnabled) {
      syncStorage.remove("appEnabled");
      syncStorage.set({ appEnabled: false });
    }
    displayList();
  });
};

const displayList = () => {
  removeList();
  localStorage.get("myWords", (res) => {
    const { myWords } = res;
    if (myWords) {
      Object.keys(myWords).map((word) => {
        const counter = myWords[word];
        const attrs_input = {
          type: "checkbox",
          name: "myList",
          value: word,
          class: "myWord_input",
          id: word,
        };
        const attrs_label = {
          for: word,
          class: "myWord_label",
        };

        createElem("input", attrs_input);
        createElem("label", attrs_label, word, counter);
        const brLine = document.createElement("br");
        myListForm.appendChild(brLine);
      });
    } else if (!myWords) {
      return;
    }
  });
};

const createElem = (el, attrs, word, counter) => {
  let elem = document.createElement(el);
  Object.keys(attrs).forEach((attr) => elem.setAttribute(attr, attrs[attr]));

  if (el == "label") {
    elem.textContent = `${word} (${counter})`;
  }

  myListForm.appendChild(elem);
};

const removeList = () => {
  const checkBoxes = document.getElementsByClassName("myWord_input");
  const labels = document.getElementsByClassName("myWord_label");
  const brs = document.getElementsByTagName("br");
  while (checkBoxes.length > 0) {
    checkBoxes[0].parentNode.removeChild(checkBoxes[0]);
    labels[0].parentNode.removeChild(labels[0]);
    brs[0].parentNode.removeChild(brs[0]);
  }
};

const handleAppBtnClick = () => {
  if (appBtn.checked) {
    setAppStatus(true);
    setBadgeTxt("");
  } else {
    setAppStatus(false);
    setBadgeTxt("off");
  }
};

const setAppStatus = (status) => {
  syncStorage.get("appEnabled", (res) => {
    const { appEnabled } = res;
    if (appEnabled) {
      syncStorage.remove("appEnabled");
    }
    syncStorage.set({ appEnabled: status });
  });
};

const handleRmBtnClick = (e) => {
  e.preventDefault();
  let checkedWords = [];
  let chkedboxes = document.querySelectorAll(
    "input[class=myWord_input]:checked"
  );

  chkedboxes.forEach((box) => {
    checkedWords.push(box.value);
  });

  localStorage.get("myWords", (res) => {
    let { myWords } = res;
    // updated myWords after removing checked words.
    checkedWords.forEach((word) => {
      delete myWords[word];
    });
    localStorage.remove("myWords");
    localStorage.set({ myWords });
  });
};

const setBadgeTxt = (msg) => {
  chrome.action.setBadgeText({ text: msg });
};

window.addEventListener("load", () => {
  initApp();
});

appBtn.addEventListener("click", () => {
  handleAppBtnClick();
});

removeBtn.addEventListener("click", (e) => {
  handleRmBtnClick(e);
});

chrome.storage.onChanged.addListener((res) => {
  const { myWords } = res;

  if (myWords) {
    if (myWords.newValue) {
      displayList();
    } else if (!myWords.newValue) return;
  } else return;
});
