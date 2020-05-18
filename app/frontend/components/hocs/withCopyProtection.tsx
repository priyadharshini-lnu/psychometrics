import React from 'react'

function withCopyProtection (WrappedComponent) {
  return class extends React.Component {
    private ref = React.createRef()

    componentDidMount () {
      const disableEvnet = (e: Event) => {
        e.preventDefault()
        return false
      }
      ['cut', 'copy', 'contextmenu'].forEach((ev) => {
        (this.ref.current as HTMLElement).addEventListener(ev, disableEvnet)
      })
    }

    render () {
      return <WrappedComponent {...this.props} ref={this.ref} />
    }
  }
}

export default withCopyProtection
