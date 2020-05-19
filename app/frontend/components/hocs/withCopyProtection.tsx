import React from 'react'

function withCopyProtection (WrappedComponent) {
  return class extends React.Component {

    componentDidMount () {
      const disableEvnet = (e: Event) => {
        e.preventDefault()
        return false
      }
      ['cut', 'copy', 'contextmenu'].forEach((ev) => {
        (this.ref as HTMLElement).addEventListener(ev, disableEvnet)
      })
    }

    private ref: HTMLElement

    render () {
      return <WrappedComponent {...this.props} forwardRef={(el) => { this.ref = el }} />
    }
  }
}

export default withCopyProtection
