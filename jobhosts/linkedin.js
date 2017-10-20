/* global chrome getDogeMessage */

const linkedinModule = {
  getSinglePostInfo: () => {
    let jobTitle = document
      .querySelector('.jobs-details-top-card__job-title')
      .innerText
      .trim()
    let company = document
      .querySelector('.jobs-details-top-card__company-info a')
      .innerText
      .trim()
    return { jobTitle, company }
  },
  // Depending on the pathname, retrieving the relevant Linkedin data is different
  getDataFromElement: (element) => {
    let hrefString, jobTitle
    if (window.location.pathname === '/jobs/') {
      hrefString = element
        .querySelector('a')
        .href
        .split('?')[0]
      jobTitle = element
        .querySelector('.job-card__title-line')
        .innerText
        .trim()
        .replace('\n', ' ')
    } else {
      hrefString = element
        .querySelector('.job-card-search__upper-content-wrapper-left a')
        .href
        .split('?')[0]
      jobTitle = element
        .querySelector('.job-card-search__title')
        .innerText
        .trim()
    }
    let host = window.location.host
    let company = element
      .querySelector('.job-card__company-name')
      .innerText

    return { hrefString, jobTitle, host, company}
  },
  processPost: (element, hiddenPosts) => {
    // Only run logic in block if we haven't 'processed' the element
    if (!element.querySelector('.jobdoge-remove')
      && !(element.getAttribute('id') === 'jobdoge-hidden-post')) {
      // Guard condition to ensure that relevant data has successfuly loaded for a given job post element
      if (!element.children.length) return

      // height: 100% property in #jobdoge-post id changes card height on /jobs/
      let origElementHeight = element.clientHeight

      // Set id for CSS transition
      element.setAttribute('id', 'jobdoge-post')

      // Get relevant data
      let { hrefString, jobTitle, host, company} = linkedinModule.getDataFromElement(element)

      if (hiddenPosts[hrefString]) {
        // If job post matches a hidden post, hide the post
        element.setAttribute('id', 'jobdoge-hidden-post')
        // Needed for job card formatting on /jobs/
        if (window.location.pathname === '/jobs/') {
          element.style.display = 'none'
        }

      } else {

        // Set up doge image
        let dogePic = document.createElement('img')
        dogePic.setAttribute('src', 'doge.png');

        // Set up doge message
        let dogeMsg
        if (window.location.pathname === '/jobs/') {
          dogeMsg = getDogeMessage(0.04, 0.16, 0.1, 0.6)
          dogeMsg.style.fontSize = '30px'
          element.style.height = `${origElementHeight}px`
        } else {
          dogeMsg = getDogeMessage(0.14, 0.58, 0.3, 0.6)
        }
        element.prepend(dogeMsg)

        // Set up button
        var button = document.createElement('Button')
        button.innerHTML = 'Hide'
        button.classList.add('jobdoge-remove')
        button.style.bottom = '16px'
        button.style.right = '16px'
        button.addEventListener('click', function() {
          // Needed for job card formatting on /jobs/
          if (window.location.pathname === '/jobs/') {
            setTimeout(() => {element.style.display = 'none'}, 1000)
          }

          // Update CSS to enable transition
          element.setAttribute('id', 'jobdoge-hidden-post')
          dogeMsg.classList.add('doge-msg-show')

          // Save relevant data to storage
          let data = {}
          let date = Date.now()
          data[hrefString] = {jobTitle, company, host, date}

          chrome.storage.sync.set(data);
        });

        button.prepend(dogePic)
        element.style.position = 'relative'
        element.prepend(button)
        button.classList.add('jobdoge-fadeIn')
      }
    }
  },
  getRows: () => {
    if (window.location.pathname === '/jobs/') {
      return [
        ...document.querySelectorAll('.card-list__item.job-card:not(.jobs-upsell)'),
        ...document.querySelectorAll('.job-card--carousel-item:not(.jobs-upsell)')
      ].filter(container => container) // filter out falsey values
    } else {
      return [
        ...document.querySelectorAll('.job-card-search'),
        ...document.querySelectorAll('.occludable-update.card-list__item')
      ].filter(container => container) // filter out falsey values
    }
  },
  getJobContainers: () => {
    if (window.location.pathname === '/jobs/') {
      return [
        ...document.querySelectorAll('.card-list.jobs-jymbii__list'),
        ...document.querySelectorAll('.peek-carousel__slides'),
      ].filter(container => container) // filter out falsey values
    } else {
      return [...document.querySelectorAll('.jobs-search-results__list')]
        .filter(container => container) // filter out falsey values
    }
  }
}
