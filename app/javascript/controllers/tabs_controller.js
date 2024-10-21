import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["button", "text", "url", "media"]
  connect() {
  }

  toggle(event) {
    event.preventDefault()
    const content = document.getElementsByClassName('tab-content')
    Array.from(content).forEach(el => {
      el.classList.add('hidden')
      console.log(el)
      // if (el.classList.contains('hidden')) {
      //   el.classList.remove('hidden')
      // } else {
      //   el.classList.add('hidden')
      // }
      // el.classList.remove('hidden')
    })
    event.target.classList.add('hidden')

    // console.log(content)
    // if (event.target.dataset.tabId == "text") {
    //   console.log(this.targets)
    // }
  }
}
