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

const getDogeMessage = () => {
  let message = document.createElement('p')
  message.style.left = `${getRandomInRange(0.1, 0.6)}%`
  message.style.top = `${getRandomInRange(0.0, 0.45)}%`
  message.style.color = getRandomColor()
  message.style.transform = `translateY(0em) rotate(${getRandomInRange(-0.12, 0.12)}deg)`
  message.innerHTML = getMessage()
  message.classList.add('doge-msg')
  return message
}
