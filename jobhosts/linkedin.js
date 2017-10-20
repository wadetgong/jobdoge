/* global chrome */

const linkedinModule = {
  processPost: (element, hiddenPosts) => {
    if (!element.querySelector('.jobdoge-remove')) {
      // Set up button
      var button = document.createElement('Button')
      button.innerHTML = 'Hide'
      button.classList.add('jobdoge-remove')
      button.style.bottom = '16px'
      button.style.right = '16px'

      element.style.position = 'relative'
      element.prepend(button)
      button.classList.add('jobdoge-fadeIn')
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
