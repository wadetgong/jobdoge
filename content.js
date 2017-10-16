/* global chrome */

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

const addListHeaders = () => {
  let headerDiv = document.createElement('div')
  let dateHeader = document.createElement('p')
  let jobHeader = document.createElement('p')
  let companyHeader = document.createElement('p')
  let unhideHeader = document.createElement('p')
  dateHeader.innerHTML = 'Hide Date'
  jobHeader.innerHTML = 'Job Name'
  companyHeader.innerHTML = 'Company'
  unhideHeader.innerHTML = 'Unhide Post'
  dateHeader.classList.add('jobdoge-row-date', 'jobdoge-row-header')
  jobHeader.classList.add('jobdoge-row-job', 'jobdoge-row-header')
  companyHeader.classList.add('jobdoge-row-company', 'jobdoge-row-header')
  unhideHeader.classList.add('jobdoge-row-unhide', 'jobdoge-row-header')
  headerDiv.classList.add('jobdoge-row')
  headerDiv.append(dateHeader)
  headerDiv.append(companyHeader)
  headerDiv.append(jobHeader)
  headerDiv.append(unhideHeader)
  headerDiv.style.display = 'flex'
  headerDiv.style.justifyContent = 'flex'
  return headerDiv
}

const buildModal = () => {
  // Set up modal
  const modal = document.createElement('div')
  modal.classList.add('jobdoge-modal')
  modal.classList.add('jobdoge-modal-closed')

  // Set up modal content
  const modalContent = document.createElement('div')
  modalContent.classList.add('jobdoge-modal-content')
  modalContent.style.transform = 'translateY(-200px)'

  // Set up close button on modal
  const closeButton = document.createElement('span')
  closeButton.innerHTML = '&times;'
  closeButton.onclick = function() {
    modal.classList.add('jobdoge-modal-closed')
    modal.classList.remove('jobdoge-modal-open')
    modalContent.style.transform = 'translateY(-200px)'
  }
  closeButton.classList.add('close')
  modalContent.prepend(closeButton)

  // Set up container in modal content
  const container = document.createElement('div')
  container.setAttribute('id', 'jobdoge-modal-container')
  modalContent.prepend(container)

  // Set up container in modal content for headers
  const headerContainer = document.createElement('div')
  headerContainer.setAttribute('id', 'jobdoge-modal-container-header')
  headerContainer.classList.add('jobdoge-row')
  headerContainer.prepend(addListHeaders())
  modalContent.prepend(headerContainer)

  // Add modal content to modal
  modal.append(modalContent)

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target === modal) {
      modal.classList.add('jobdoge-modal-closed')
      modal.classList.remove('jobdoge-modal-open')
      modalContent.style.transform = 'translateY(-200px)'
    }
  }

  return modal
}

const buildRow = (url, post) => {
  const { company, date, host, jobTitle} = post

  // Create row div
  let row = document.createElement('div')
  row.classList.add('jobdoge-row')

  // Create date column
  let dateCol = document.createElement('p')
  let dateStr = new Date(post.date).toString().slice(4, 15)
  dateCol.innerHTML = dateStr
  dateCol.classList.add('jobdoge-row-date')

  // Create job name column
  let jobCol = document.createElement('a')
  jobCol.target = '_blank'
  jobCol.innerHTML = jobTitle
  jobCol.href = url
  jobCol.classList.add('jobdoge-row-job')

  // Create company name column
  let compCol = document.createElement('p')
  compCol.innerHTML = company
  compCol.classList.add('jobdoge-row-company')

  // Create unhide button
  let buttonDiv = document.createElement('div')
  let unhideButton = document.createElement('button')
  unhideButton.innerHTML = 'Unhide'
  unhideButton.onclick = function() {
    chrome.storage.sync.remove([url], function() {
      console.log('removed url ', url)
      var error = chrome.runtime.lastError
      if (error) console.error(error)
      else row.remove()
    })
  }
  buttonDiv.classList.add('jobdoge-row-unhide')
  buttonDiv.append(unhideButton)

  // Add elements to row div
  row.append(dateCol)
  row.append(compCol)
  row.append(jobCol)
  row.append(buttonDiv)

  return row
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
  const modal = buildModal()
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
            modalContainer.append(buildRow(key, data))
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

