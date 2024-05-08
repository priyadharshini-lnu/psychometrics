import { createRoot } from 'react-dom/client'
import modules from '../modules'

const reactRails = {
  mountComponents (domain, components) {
    document.querySelectorAll('[data-react-class]').forEach((e) => {
      const props = JSON.parse(e.dataset.reactProps)
      const ReactComponent = modules[domain][e.dataset.reactClass]
      if ((!components || components.includes(e.dataset.reactClass)) && ReactComponent) {
        const root = createRoot(e)
        root.render(<ReactComponent {...props} />)
      }
    })
  },
}

export default reactRails
