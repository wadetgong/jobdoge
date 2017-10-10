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
      supportInfo.classList.add('success')
      requestSupport.style.display = 'none'
    } else {
      supportInfo.innerHTML = `${rootUrl} is not supported by JobDoge yet.`
      supportInfo.classList.remove('success')
      requestSupport.style.display = 'block'
      requestSupport.innerHTML = `Request support for ${rootUrl}`

    }
    // chrome.storage.sync.get(null, (items) => {
    //   console.log('items from storage', items)
    // });
  });
});
