const storage = chrome.storage.local;

const isThereMyLists = (selectedText) => {
  if (selectedText.length == 0) {
    return;
  }
  storage.get(['myWords'], (value) => {
    const { myWords } = value;

    if (!myWords && selectedText) {
      createMyLists(selectedText);
    } else if (myWords) {
      const keys = Object.keys(myWords);
      const theWord = keys.find((key) => {
        return key == selectedText;
      });

      if (!theWord) {
        addWord(selectedText);
      } else updateCounter(theWord);
    }
  });
};

const checkHistory = (selectedText) => {
  if (selectedText.length == 0) {
    return;
  }
  storage.get(['myWords'], (value) => {
    const { myWords } = value;

    if (!myWords) {
      return;
    } else if (myWords) {
      const keys = Object.keys(myWords);
      const theWord = keys.find((key) => {
        return key == selectedText;
      });

      if (theWord) {
        updateCounter(selectedText);
      }
    }
  });
};

const randomRgba = () => {
  const colors = [
    'rgba(246,110,110, .2)',
    'rgba(246,179,110, .2)',
    'rgba(245,246,110, .2)',
    'rgba(110,243,246, .2)',
    'rgba(156,110,246, .2)',
    'rgba(240,0,255,.2)',
    'rgba(177,246,110, .2)',
  ];

  let index = Math.floor(Math.random() * 7);

  return colors[index];
};

const createMyLists = (word) => {
  if (word.length == 0) {
    return;
  }

  storage.set({ myWords: { [word]: 1 } });
  const bgColor = randomRgba();
  storage.set({ wordColors: { [word]: bgColor } });
};

const addWord = (word) => {
  if (word.length == 0) {
    return;
  }
  storage.get('myWords', (value) => {
    const myList = value.myWords;
    const newWord = { [word]: 1 };
    const updatedList = Object.assign(myList, newWord);
    storage.remove('myWords');
    storage.set({ myWords: updatedList });
  });

  storage.get('wordColors', (result) => {
    const colorList = result.wordColors;
    let bgColor = randomRgba();
    const newWord = { [word]: bgColor };
    const updatedList = Object.assign(colorList, newWord);
    storage.remove('wordColors');
    storage.set({ wordColors: updatedList });
  });
};

const removeWord = (word) => {
  storage.get('myWords', (res) => {
    let { myWords } = res;
    // updated myWords after removing checked words.
    delete myWords[word];

    storage.remove('myWords');
    storage.set({ myWords });
  });

  storage.get('wordColors', (result) => {
    let { wordColors } = result;
    // updated myWords after removing checked words.
    delete wordColors[word];

    storage.remove('wordColors');
    storage.set({ wordColors });
  });
};
// update counter should be moved to another part
// ex. when double click the word
const updateCounter = (theWord) => {
  storage.get('myWords', (value) => {
    const myList = value.myWords;
    ++myList[theWord];
    storage.remove('myWords');
    storage.set({ myWords: myList });
  });
};

const WordsToString = (vari) => {
  let string = '';

  storage.get('myWords', (res) => {
    const myWords = res.myWords;
    const wordsArr = Object.keys(myWords);
    for (let i = 0; i < wordsArr.length; i++) {
      if (i !== wordsArr.length - 1) {
        let wordNComma = wordsArr[i] + ',';
        string = string.concat(wordNComma);
      } else if (i == wordsArr.length - 1) {
        string = string.concat(wordsArr[i]);
      }
    }
    return (vari = string);
  });
};
