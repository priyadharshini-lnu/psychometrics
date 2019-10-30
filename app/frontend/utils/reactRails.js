import ReactDOM from 'react-dom'
import React from 'react'
import modules from '../modules'

const reactRails = {
  mountComponents (domain, components) {
    document.querySelectorAll('[data-react-class]').forEach((e) => {
      const props = JSON.parse(e.dataset.reactProps)
      const ReactComponent = modules[domain][e.dataset.reactClass]
      if ((!components || components.includes(e.dataset.reactClass)) && ReactComponent) {
        ReactDOM.render(<ReactComponent {...props} />, e)
      }
    })
  },
}

export default reactRails
