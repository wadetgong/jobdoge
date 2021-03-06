/* global chrome getDogeMessage */

const builtInModule = {
  getSinglePostInfo: () => {
    let jobTitle = document.querySelector('.nj-job-title')
      .innerHTML
      .trim()
    let company = document.querySelector('.nc-fallback-title a')
      .innerHTML
      .trim()
    return { jobTitle, company }
  },
  processPost: (element, hiddenPosts) => {
    if (!element.querySelector('.jobdoge-remove')) {
      // Set id for CSS transition
      element.setAttribute('id', 'jobdoge-post')

      // Get relevant data
      let jobInfo = element.querySelector('.job-title a')
      let hrefString = jobInfo.href
      let jobTitle = jobInfo.text
      let host = jobInfo.hostname
      let companyInfo = element.querySelector('.job-company a')
      let company = companyInfo
        ? companyInfo.text
        : element.querySelector('.job-company').innerHTML

      // Hide or add button
      if (hiddenPosts[hrefString]) {
        // If job post matches a hidden post, hide the post
        element.setAttribute('id', 'jobdoge-hidden-post')
      } else {

        // Set up doge image
        let dogePic = getDogeImage(0.16, 0.47, 0.22, 0.22)

        // Set up doge message
        let dogeMsg = getDogeMessage(0.1, 0.6, 0.0, 0.45)
        element.prepend(dogeMsg)

        // Set up button
        var button = document.createElement('Button')
        button.innerHTML = 'Hide'
        button.style.bottom = '22px'
        button.classList.add('jobdoge-remove')
        button.addEventListener('click', function() {
          // Update CSS to enable transition
          element.setAttribute('id', 'jobdoge-hidden-post')
          dogeMsg.classList.add('doge-msg-show')

          // Save relevant data to storage
          let data = {}
          let date = Date.now()
          data[hrefString] = {jobTitle, company, host, date}
          chrome.storage.local.set(data);
        });
        element.prepend(button)
        button.classList.add('jobdoge-fadeIn')
        // Timeout set so fade in of element doesn't show doge image in background
        setTimeout(() => {
          element.insertBefore(dogePic, element.children[1])
        }, 1000)
      }
    }
  },
  getRows: () => {
    return [...document.querySelectorAll('.results.jobs .views-row')]
  },
  getJobContainers: () => {
    return [document.querySelector('#content-area')]
      .filter(container => container) // filter out falsey values
  }
}
