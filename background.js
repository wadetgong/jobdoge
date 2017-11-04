/* global chrome */

const updateIcon = tab => {
  let { url } = tab
  if (url.slice(0, 9) === 'chrome://') {
    chrome.browserAction.setIcon({path: 'doge_bw.png'})
  } else {
    chrome.browserAction.setIcon({path: 'doge.png'})
  }
}

chrome.tabs.onActivated.addListener(activeInfo => {
  const { tabId } = activeInfo
  chrome.tabs.get(tabId, tab => {
    updateIcon(tab)
  })
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    updateIcon(tab)
  }
})
