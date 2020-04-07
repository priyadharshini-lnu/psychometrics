import React from 'react'
import PropTypes from 'prop-types'

import styles from './Overlay.scss'

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
      position: {
        width, height, x, y,
      },
    } = this.props

    const style = {
      top: x, left: y, width, height,
    }

    if (hasError) return <div>{hasError.message}</div>

    return (
      <div className={styles.overlay}>
        <img className={styles.frame} src={image} style={style} />
      </div>
    )
  }
}

Overlay.propTypes = {
  resolve: PropTypes.func,
  position: PropTypes.object,
}
