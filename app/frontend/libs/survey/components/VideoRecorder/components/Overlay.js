import React from 'react'
import PropTypes from 'prop-types'

import styles from './Overlay.scss'
import frames from './frames'

export class Overlay extends React.Component {
  constructor () {
    super()

    this.state = {
      image: null,
    }
  }

  async componentDidMount () {
    try {
      const { resolve } = this.props
      const { default: image } = await resolve()
      this.setState({ image })
    } catch (error) {
      this.setState({ hasError: error })
    }
  }

  componentDidCatch (error) {
    this.setState({ hasError: error })
  }

  render () {
    const { image, hasError } = this.state
    const {
      frame,
      position: {
        x, y, [`${frame}Width`]: width,
      },
      position,
    } = this.props

    const style = {
      top: y, left: x, width,
    }

    if (hasError) return <div>{hasError.message}</div>
    const Frame = frames[frame]
    return (
      <div className={styles.overlay}>
        <Frame boundaries={position} />
      </div>
    )
  }
}

Overlay.propTypes = {
  frame: PropTypes.string,
  resolve: PropTypes.func,
  position: PropTypes.object,
}
