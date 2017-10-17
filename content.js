/* global chrome builtInModule modalModule linkedinModule */

// Key: site host, Value: valid single job post pathnames
const supportedSites = {
  'www.builtinchicago.org': builtInModule,
  'www.builtinnyc.com': builtInModule,
  'www.builtinla.com': builtInModule,
  'www.builtincolorado.com': builtInModule,
  'www.linkedin.com': linkedinModule,
}
const { host } = window.location

const traversePosts = (domElements, hiddenPosts) => {
  for (let i = 0; i < domElements.length; i++) {
    let currentElem = domElements[i]
    supportedSites[host].processPost(currentElem, hiddenPosts)
  }
}

const updatePosts = () => {
  if (supportedSites[host]) {
    chrome.storage.sync.get(null, listHistory => {
      traversePosts(
        supportedSites[host].getRows(),
        listHistory
      )
    })
  }
}
const debouncedUpdatePosts = debounce(updatePosts, 250)


let currentLocation = window.location.href

const handleDOMChange = () => {
  let newLocation = window.location.href
  console.log('handleDOMChange')

  currentLocation = newLocation
  if (supportedSites[host]) {
    const contentContainers = supportedSites[host].getJobContainers()

    contentContainers.forEach(container => container
      .addEventListener('DOMSubtreeModified', function() {
        debouncedUpdatePosts()
      })
    )
  }
}
const debouncedHandleDOMChange = debounce(handleDOMChange, 250)

window.addEventListener('load', function load() {
  window.removeEventListener('load', load, false)
  debouncedUpdatePosts()

  document
    .querySelector('body')
    .addEventListener('DOMSubtreeModified', debouncedHandleDOMChange)

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
        sendResponse()
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

