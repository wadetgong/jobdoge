/* global chrome */

const supportedSites = {
  'www.builtinchicago.org': true,
  'www.builtinnyc.com': true,
  'www.builtinla.com': true,
  'www.builtincolorado.com': true,
}

function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    var tab = tabs[0];
    var url = tab.url;
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url, tab);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  getCurrentTabUrl((url, tab) => {

    const rootUrl = url.split('/')[2]
    var supportInfo = document.getElementById('support-info');
    var requestSupport = document.getElementById('request-support');

    if (supportedSites[rootUrl]) {
      supportInfo.innerHTML = `${rootUrl} is supported by JobDoge!`
      supportInfo.style.color = '#099409'
      requestSupport.style.display = 'none'
    } else if (rootUrl && rootUrl !== 'newtab') {
      supportInfo.innerHTML = `${rootUrl} is not supported by JobDoge yet.`
      supportInfo.style.color = 'rgb(224, 13, 15)'
      requestSupport.style.display = 'block'
      requestSupport.innerHTML = `Request support for ${rootUrl}`
      requestSupport.href = `mailto:jobdoge@gmail.com?subject=JobDoge%20Support%20Request&body=Please%20add%20support%20for%20${rootUrl}`
    }

    chrome.storage.sync.get(null, (items) => {
      console.log('items from storage', items)
      console.log('keys from storage', Object.keys(items))
      const hiddenCount = document.querySelector('#hidden-info')
      hiddenCount.innerHTML = `Hidden posts: ${Object.keys(items).length}`
    });

    let viewHidden = document.querySelector('#view-hidden')
    viewHidden.onclick = function() {
      chrome.tabs.sendMessage(tab.id, {
        text: 'open_modal',
      }, () => {
        window.close()
      })
    }
  });
})
