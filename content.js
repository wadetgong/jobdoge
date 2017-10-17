<<<<<<< Updated upstream
/* global chrome */
=======
/* global chrome builtInModule modalModule */
>>>>>>> Stashed changes

// Key: site host, Value: valid single job post pathnames
const supportedSites = {
  'www.builtinchicago.org': ['/job/*'],
  'www.builtinnyc.com': true,
  'www.builtinla.com': true,
  'www.builtincolorado.com': true,
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
      let companyInfo = currentElem.querySelector('.job-company a')
      let company = companyInfo
        ? companyInfo.text
        : currentElem.querySelector('.job-company').innerHTML

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
          let date = Date.now()
          data[hrefString] = {jobTitle, company, host, date}
          chrome.storage.sync.set(data);
        });
        currentElem.prepend(button)
      }
    }
  }
}

const updatePosts = () => {
  const { host } = window.location
  if (supportedSites[host]) {
    chrome.storage.sync.get(null, listHistory => {
      traversePosts(
        document.querySelectorAll('.results.jobs .views-row'),
        listHistory
      )
    })
  }
}

window.addEventListener('load', function load() {
  window.removeEventListener('load', load, false)
  updatePosts()

  const { host } = window.location
  if (supportedSites[host]) {
    const content = document.querySelector('#content-area')
    content.addEventListener('DOMSubtreeModified', function() {
      updatePosts()
    })
  }

  // Build modal and attach to DOM
  const modal = modalModule.buildModal()
  const modalContent = modal.querySelector('.jobdoge-modal-content')
  document.querySelector('body').prepend(modal)

  // Add listener to listen for messages from popup
  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    const { text, href } = msg
    if (text === 'open_modal') {
      modal.classList.add('jobdoge-modal-open')
      modal.classList.remove('jobdoge-modal-closed')
      modalContent.style.transform = 'translateY(0px)'

      chrome.storage.sync.get(null, listHistory => {
        const modalContainer = document.querySelector('#jobdoge-modal-container')
        // Clear children
        while (modalContainer.firstChild) {
          modalContainer.removeChild(modalContainer.firstChild);
        }

        let jobPostArr = []
        for (let key in listHistory) {
          jobPostArr.push({key, data: listHistory[key]})
        }
        jobPostArr
          .sort((a, b) => b.data.date - a.data.date)
          .forEach(jobObj => {
            let { key, data } = jobObj
            modalContainer.append(modalModule.buildRow(key, data))
          })
      })
    }
    if (text === 'hide_status') {
      chrome.storage.sync.get(href, hideStatus => {
        sendResponse(Object.keys(hideStatus).length > 0)
      })
    }
    if (text === 'hide_post') {
      let jobTitle = document.querySelector('.nj-job-title')
        .innerHTML
        .trim()
      let company = document.querySelector('.nc-fallback-title a')
        .innerHTML
        .trim()
      let date = Date.now()
      let data = {}
      data[href] = {jobTitle, company, host, date}
      chrome.storage.sync.set(data, () => {
        sendResponse()
      });
    }
    if (text === 'unhide_post') {
      chrome.storage.sync.remove(href, () => {
        sendResponse()
      })
    }

    return true
  })
})

