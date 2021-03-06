const chooseRandom = arr => {
  const randomIndex = Math.floor(Math.random() * arr.length)
  return arr[randomIndex]
}

const getMessage = () => {
  const messages = [
    'Much goodbye',
    'No thank u',
    'Next pls',
    'Wow',
    'No like',
    'Much next',
  ]
  return chooseRandom(messages)
}

const getRandomInRange = (min, max) => {
  return Math.round((Math.random() * (max - min) + min) * 100)
}

const getRandomColor = () => {
  const colors = [
    '#0500fe',
    '#ff00fe',
    '#fe0400',
    '#fe7e00',
    '#0f0',
  ]
  return chooseRandom(colors)
}

const getDogeMessage = (horizMin, horizMax, vertMin, vertMax) => {
  let message = document.createElement('p')
  message.style.left = `${getRandomInRange(horizMin, horizMax)}%`
  message.style.top = `${getRandomInRange(vertMin, vertMax)}%`
  message.style.color = getRandomColor()
  message.style.transform = `translateY(0em) rotate(${getRandomInRange(-0.12, 0.12)}deg)`
  message.innerHTML = getMessage()
  message.classList.add('doge-msg')
  return message
}

const getDogeImage = (horizMin, horizMax, vertMin, vertMax) => {
  let dogePic = document.createElement('div')
  dogePic.classList.add('jobdoge-image')
  if (vertMin) dogePic.style.bottom = `${getRandomInRange(vertMin, vertMax)}px`
  if (horizMin) dogePic.style.right = `${getRandomInRange(horizMin, horizMax)}px`
  return dogePic
}
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce (func, wait, immediate) {
  var timeout
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    var callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}
