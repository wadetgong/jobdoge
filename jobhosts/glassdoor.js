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

  },
  getRows: () => {
    const path = window.location.pathname.slice(0, 5)
    if (path === '/inde' || path === '/Jobs') {
      return [...document.querySelector('.jlGrid').children]
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
  }
}
