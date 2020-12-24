import React from 'react'

function withCopyProtection (WrappedComponent) {
  return class extends React.Component {
    private ref: HTMLElement

    componentDidMount () {
      const disableEvent = (e: Event) => {
        e.preventDefault()
        return false
      }
      ['cut', 'copy', 'contextmenu'].forEach((ev) => {
        (this.ref as HTMLElement).addEventListener(ev, disableEvent)
      })
    }

    render () {
      return <WrappedComponent {...this.props} containerRef={(el) => { this.ref = el }} />
    }
  }
}

export default withCopyProtection
