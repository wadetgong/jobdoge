/* global chrome builtInModule modalModule linkedinModule debounce glassdoorModule */

// Key: site host, Value: valid single job post pathnames
const supportedSites = {
  'www.builtinchicago.org': builtInModule,
  'www.builtinnyc.com': builtInModule,
  'www.builtinla.com': builtInModule,
  'www.builtincolorado.com': builtInModule,
  'www.linkedin.com': linkedinModule,
  'www.glassdoor.com': glassdoorModule,
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
    chrome.storage.local.get(null, listHistory => {
      traversePosts(
        supportedSites[host].getRows(),
        listHistory
      )
    })
  }
}
const debouncedUpdatePosts = debounce(updatePosts, 500)

const containersShouldUpdate = (oldContainers, newContainers) => {
  if (currentContainers.length !== newContainers.length) return true

  let containerHash = {}
  for (let i = 0; i < currentContainers.length; i++) {
    containerHash[[...currentContainers[i].classList].join('')] = true
  }

  for (let i = 0; i < newContainers.length; i++) {
    if (!containerHash[[...newContainers[i].classList].join('')]) return true
  }

  return false
}

let currentContainers = supportedSites[host] && supportedSites[host].getJobContainers()
const handleDOMChange = () => {
  if (supportedSites[host]) {
    let newContainers = supportedSites[host].getJobContainers()

    // console.log('containersShouldUpdate', containersShouldUpdate(currentContainers, newContainers))

    if (containersShouldUpdate(currentContainers, newContainers)) {
      currentContainers = newContainers
      debouncedUpdatePosts()

      currentContainers.forEach(container => container
        .addEventListener('DOMSubtreeModified', function() {
          debouncedUpdatePosts()
        })
      )
    }
  }
}
const debouncedHandleDOMChange = debounce(handleDOMChange, 500)

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
    let jobKey
    // href from msg may need to be converted depending on job site
    if (href) {
      let { convertUrl } = supportedSites[host]
      if (convertUrl) jobKey = convertUrl(href)
      else jobKey = href
    }


    if (text === 'open_modal') {
      modal.classList.add('jobdoge-modal-open')
      modal.classList.remove('jobdoge-modal-closed')
      modalContent.style.transform = 'translateY(0px)'

      chrome.storage.local.get(null, listHistory => {
        modalModule.updateModalContent(listHistory)
        sendResponse()
      })
    }

    if (text === 'hide_status') {
      chrome.storage.local.get(jobKey, hideStatus => {
        sendResponse(Object.keys(hideStatus).length > 0)
      })
    }
    if (text === 'hide_post') {
      let { jobTitle, company } = supportedSites[host].getSinglePostInfo()
      let data = {}
      let date = Date.now()

      data[jobKey] = {jobTitle, company, host, date}
      chrome.storage.local.set(data, () => {
        sendResponse()
      });
    }
    if (text === 'unhide_post') {

      chrome.storage.local.remove(jobKey, () => {
        sendResponse()
      })
    }

    return true
  })
})

