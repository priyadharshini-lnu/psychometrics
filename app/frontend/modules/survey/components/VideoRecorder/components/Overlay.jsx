import { Component } from 'react'
import PropTypes from 'prop-types'

import styles from './Overlay.less'
import frames from './frames'

export class Overlay extends Component {
  constructor () {
    super()

    this.state = {}
  }

  componentDidCatch (error) {
    this.setState({ hasError: error })
  }

  render () {
    const { hasError } = this.state
    const {
      frame,
      boundaries,
      trackerOptions,
    } = this.props

    if (hasError) return <div>{hasError.message}</div>
    const Frame = frames[frame]
    return (
      <div className={styles.overlay}>
        <Frame boundaries={boundaries} trackerOptions={trackerOptions} />
      </div>
    )
  }
}

Overlay.propTypes = {
  frame: PropTypes.string,
  boundaries: PropTypes.object,
  trackerOptions: PropTypes.object,
}
