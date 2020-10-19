const amountOfPigs = 8;
const pigs = document.querySelectorAll('.pig-info');
pigs.forEach((pig, index) => {
  index++;
  pig.setAttribute('id', 'pig-' + index);
  pig.style.setProperty("z-index", String(amountOfPigs - index));
});
let visiblePig = pigs[0];

const images = document.querySelectorAll('.image');
images.forEach((image, index) => {
  if (index + 1 === amountOfPigs) {
    return;
  }
  image.addEventListener('touchstart', handleImageTouchStart);
  image.addEventListener('touchmove', handleImageTouchMove);
});

let xStart, yStart, xEnd, yEnd;
const X_MIN_DIFF = 60, Y_MIN_DIFF = 100;

function getXY(event) {
  const touch = event.touches[0];
  return [touch.clientX, touch.clientY];
}

function handleImageTouchStart(event) {
  [xStart, yStart] = getXY(event);
}

function handleImageTouchMove(event) {
  [xEnd, yEnd] = getXY(event);
  const xDiff = xEnd - xStart,
    yDiff = yEnd - yStart;

  let action;
  if (Math.abs(xDiff) > Math.abs(yDiff) - 140) {
    if (Math.abs(xDiff) < X_MIN_DIFF) {
      return;
    }
    if (xDiff < 0) {
      action = 'dislike';
    } else {
      action = 'like';
    }
  } else {
    if (Math.abs(yDiff) < Y_MIN_DIFF) {
      return;
    }
    if (yDiff < 0) {
      action = 'super-like';
    } else {
      return;
    }
  }

  for (let elem of event.path) {
    if (elem.className === 'image') {
      elem.removeEventListener('touchmove', handleImageTouchMove);
      break;
    }
  }
  addActionOnPig(visiblePig, action);
}

const actionButtons = document.querySelectorAll('.action-button');
actionButtons.forEach(actionButton => {
  actionButton.addEventListener('click', handleButtonClick);
});

function handleButtonClick(event) {
  let action;
  for (let elem of event.path) {
    let elemClass = elem.className;
    if (typeof elemClass === 'string' && elemClass.startsWith('action-button')) {
      action = elemClass.substr(elemClass.indexOf(' ') + 1);
      break;
    }
  }
  addActionOnPig(visiblePig, action);
}

function addActionOnPig(pig, action) {
  pig.classList.add(action + 'd'); // ...liked

  const pigNumber = parseInt(pig.id.substr(pig.id.indexOf('-') + 1)) + 1;
  const nextPig = document.querySelector('#' + 'pig-' + pigNumber);
  nextPig.classList.add('visible');
  visiblePig = nextPig;
  if (pigNumber === amountOfPigs) {
    document.querySelector('.buttons').classList.add('invisible');
  }

  const message = document.querySelector('.' + action + "-message");
  message.style.setProperty("opacity", "1");
  setTimeout(() => {
    message.style.setProperty("opacity", "0");
  }, 500);
}
