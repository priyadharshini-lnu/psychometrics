/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './StarBar.scss'

const { $ } = window
const STAR_WIDTH = 32
class StarBar extends Component {
  static propTypes = {
    stars: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  }

  constructor (props) {
    super(props)

    this.state = {
      width: `${STAR_WIDTH * props.value}px`,
      displayedWidth: `${STAR_WIDTH * props.value}px`,
    }
  }

  componentWillReceiveProps (newValues) {
    const { value } = this.props
    if (newValues.value !== value) {
      this.setState({
        displayedWidth: `${STAR_WIDTH * newValues.value}px`,
      })
    }
  }

  setValue = (e) => {
    const { onClick } = this.props
    const width = e.nativeEvent.clientX - ($(e.currentTarget).offset()).left
    const value = this.calcValueFromWidth(width)
    this.setState({
      width: `${value * STAR_WIDTH}px`,
    })
    onClick && onClick(value)
  }

  calcValueFromWidth = (width) => {
    const { type } = this.props
    switch (type) {
      case 'Discrete':
        return Math.ceil(width / STAR_WIDTH)
      case 'Half Step':
        return Math.ceil(width * 2 / STAR_WIDTH) / 2
      case 'Continuous':
        return width / STAR_WIDTH
      default:
    }
  }

  handleMouseOver = (e) => {
    const width = e.nativeEvent.clientX - ($(e.currentTarget).offset()).left
    this.setState({
      displayedWidth: `${this.calcValueFromWidth(width) * STAR_WIDTH}px`,
    })
  }

  handleMouseOut = () => {
    const { width } = this.state
    this.setState({
      displayedWidth: width,
    })
  }

  render () {
    const { stars } = this.props
    const { displayedWidth } = this.state
    return (
      <div
        onClick={this.setValue}
        onMouseMove={this.handleMouseOver}
        onMouseOut={this.handleMouseOut}
        className={styles.root}
      >
        <div className={styles.placeholderContainer}>
          {_.times(stars, i => (
            <span key={i} className={`fa fa-star-o ${styles.placeholder}`} />
          ))}
        </div>
        <div className={styles.starsContainer} style={{ width: displayedWidth }}>
          {_.times(stars, i => (
            <span key={i} className={`fa fa-star ${styles.star}`} />
          ))}
        </div>
      </div>
    )
  }
}

export default StarBar
