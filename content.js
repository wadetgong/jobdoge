/* global chrome */

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
      let company = currentElem
        .querySelector('.job-company a')
        .text

      if (hiddenPosts[hrefString]) {
        // If job post matches a hidden post, hide the post
        currentElem.setAttribute('id', 'jobdoge-hidden-post')
      } else {
        // Set up button
        var button = document.createElement('Button')
        button.innerHTML = 'Hide'
        button.classList.add('jobdoge-remove')
        button.addEventListener('click', function() {
          currentElem.setAttribute('id', 'jobdoge-hidden-post')

          let data = {}
          data[hrefString] = {jobTitle, company}
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
