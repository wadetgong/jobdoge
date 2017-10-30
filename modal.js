/* global chrome */

const modalModule = {
  addListHeaders: () => {
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
  },
  buildModal: () => {
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
    headerContainer.prepend(modalModule.addListHeaders())
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
  },
  buildRow: (url, post) => {
    const { company, date, jobTitle} = post

    // Create row div
    let row = document.createElement('div')
    row.classList.add('jobdoge-row')

    // Create date column
    let dateCol = document.createElement('p')
    let dateStr = new Date(date).toString().slice(4, 15)
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
      chrome.storage.local.remove([url], function() {
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
  },
  updateModalContent: listHistory => {
    const modalContainer = document.querySelector('#jobdoge-modal-container')
    // Clear children
    while (modalContainer.firstChild) {
      modalContainer.removeChild(modalContainer.firstChild);
    }

    let jobPostArr = []
    for (let key in listHistory) {
      jobPostArr.push({key, data: listHistory[key]})
    }

    if (jobPostArr.length) {
      jobPostArr
        .sort((a, b) => b.data.date - a.data.date)
        .forEach(jobObj => {
          let { key, data } = jobObj
          modalContainer.append(modalModule.buildRow(key, data))
        })
    } else {
      let noPostsDiv = document.createElement('div')
      let noPostsMsg = document.createElement('h1')
      noPostsMsg.style.color = 'lightgray'
      noPostsMsg.innerText = 'You haven\'t hidden any job posts yet!'
      noPostsDiv.style.marginTop = '25px'
      noPostsDiv.style.textAlign = 'center'
      noPostsDiv.append(noPostsMsg)
      modalContainer.append(noPostsDiv)
    }
  }
}
