/* global chrome getDogeMessage getDogeImage*/

const glassdoorModule = {
  getSinglePostInfo: () => {
    let jobTitle = document
      .querySelector('.noMargTop.margBotSm.strong')
      .innerText
      .trim()
    let company = document
      .querySelector('.ib.padRtSm')
      .innerText
      .trim()
    return { jobTitle, company }
  },
  getDataFromElement: element => {
    const host = window.location.host
    let jobId = element
      .querySelector('.flexbox a')
      .href
      .split('&')
      .find(queryItem => queryItem.slice(0, 12) === 'jobListingId')
      .split('=')[1]
    let hrefString = `https://www.glassdoor.com/partner/jobListing.htm?ao=266220&jobListingId=${jobId}`
    let jobTitle = element
      .querySelector('.flexbox')
      // Had to split into 2 separate querySelectors because single querySelector wasn't working on /Job/ page
      .querySelector('a')
      .innerText
      .trim()
    let companyStr = [
      ...element
        .querySelector('.empLoc')
        .firstChild
        .childNodes
      ]
      .find(node => node.nodeName === '#text')
      .data
      .trim()
    let company = companyStr.slice(-2) === ' –'
      ? companyStr.slice(0, -2)
      : companyStr
    return { hrefString, jobTitle, host, company}
  },
  processPost: (element, hiddenPosts) => {
    // Only run logic in block if we haven't 'processed' the element
    if (!element.querySelector('.jobdoge-remove')
      && !(element.getAttribute('id') === 'jobdoge-hidden-post')) {

      // Set id for CSS transition
      element.setAttribute('id', 'jobdoge-post')

      // Get relevant data
      let { hrefString, jobTitle, host, company} = glassdoorModule.getDataFromElement(element)

      if (hiddenPosts[hrefString]) {
        // If job post matches a hidden post, hide the post
        element.setAttribute('id', 'jobdoge-hidden-post')
      } else {

        // Set up doge image
        let dogePic = getDogeImage(0.16, 0.37, 0, 0)

        // Set up doge message
        let dogeMsg = getDogeMessage(0.14, 0.5, 0.3, 0.6)
        element.prepend(dogeMsg)

        // Set up button div
        var buttonContainer = document.createElement('div')
        buttonContainer.style.height = '26px'
        buttonContainer.style.flex = 1
        buttonContainer.style.position = 'relative'

        // Set up button
        var button = document.createElement('button')
        button.innerHTML = 'Hide'
        button.classList.add('jobdoge-remove')
        // button.style.bottom = '16px'
        button.style.right = '0px'
        // button.style.position = 'relative'
        button.addEventListener('click', function() {

          // Update CSS to enable transition
          element.setAttribute('id', 'jobdoge-hidden-post')
          dogeMsg.classList.add('doge-msg-show')

          // Save relevant data to storage
          let data = {}
          let date = Date.now()
          data[hrefString] = {jobTitle, company, host, date}

          chrome.storage.sync.set(data)
        })

        buttonContainer.append(button)

        element.querySelectorAll('.flexbox')[2].append(buttonContainer)
        button.classList.add('jobdoge-fadeIn')
        // Timeout set so fade in of element doesn't show doge image in background
        setTimeout(() => { buttonContainer.append(dogePic) }, 1000)
      }
    }
  },
  getRows: () => {
    const path = window.location.pathname.slice(0, 5)
    if (path === '/inde' || path === '/Jobs') {
      return [...document.querySelector('.jlGrid').children]
        // Remove irrelavent element with class name showMore
        .filter(element => !element.classList.contains('showMore'))
    } else if (path === '/Job/') {
      return [...document.querySelector('.jlGrid.hover').children]
    } else {
      return []
    }
  },
  getJobContainers: () => {
    const path = window.location.pathname.slice(0, 5)
    if (path === '/inde' || path === '/Jobs') {
      return [...document.querySelectorAll('.jlGrid')]
        .filter(container => container) // filter out falsey values
    } else if (path === '/Job/') {
      return [...document.querySelectorAll('.jlGrid.hover')]
        .filter(container => container) // filter out falsey values
    } else {
      return []
    }
  },
  // convertUrl is needed because Glassdoor job links are dynamic. JobDoge converts url's into a unique, consistent path per job post using job ID
  convertUrl: jobUrl => {
    let jobId = jobUrl
      .split('?')
      .find(query => query.slice(0, 2) === 'jl')
      .split('&')[0]
      .slice(3)
    return `https://www.glassdoor.com/partner/jobListing.htm?ao=266220&jobListingId=${jobId}`
  }
}
