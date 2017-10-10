/* global chrome */

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

const traversePosts = (domElements, hiddenPosts) => {
  for (let i = 0; i < domElements.length; i++) {
    let currentElem = domElements[i]

    if (!currentElem.querySelector('.jobdoge-remove')) {
      // Set id for CSS transition
      currentElem.setAttribute('id', 'jobdoge-post')

      // Get relevant data
      let jobInfo = currentElem.querySelector('.job-title a')
      let hrefString = jobInfo.href
      let jobTitle = jobInfo.text
      let host = jobInfo.hostname
      let company = currentElem
        .querySelector('.job-company a')
        .text

      if (hiddenPosts[hrefString]) {
        // If job post matches a hidden post, hide the post
        currentElem.setAttribute('id', 'jobdoge-hidden-post')
      } else {

        // Set up doge message
        let dogeMsg = getDogeMessage()
        currentElem.prepend(dogeMsg)

        // Set up button
        var button = document.createElement('Button')
        button.innerHTML = 'Hide'
        button.classList.add('jobdoge-remove')
        button.addEventListener('click', function() {
          // Update CSS to enable transition
          currentElem.setAttribute('id', 'jobdoge-hidden-post')
          dogeMsg.classList.add('doge-msg-hidden')

          // Save relevant data to storage
          let data = {}
          data[hrefString] = {jobTitle, company, host}
          chrome.storage.sync.set(data);
        });
        currentElem.prepend(button)
      }
    }
  }
}

const updatePosts = () => {
  chrome.storage.sync.get(null, listHistory => {
    traversePosts(
      document.querySelectorAll('.results.jobs .views-row'),
      listHistory
    )
  })
}


window.addEventListener('load', function load(event) {
  window.removeEventListener('load', load, false)
  updatePosts()

  const content = document.querySelector('#content-area')
  content.addEventListener('DOMSubtreeModified', function() {
    updatePosts()
  })
})

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    const { text, className } = msg
    if (text === 'dom_elements') {
        // Call the specified callback, passing
        // the web-page's DOM content as argument
        // traversePosts(document.querySelectorAll(className));
        updatePosts()
    }
});
