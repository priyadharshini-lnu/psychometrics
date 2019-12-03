import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Buttons from 'views/Question/components/Buttons'
import buttons from 'views/Question/components/Buttons.scss'
import styles from './PageBreak.scss'

class PageBreak extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  state = {
    fadeout: false,
  }

  remove = () => {
    const { model, removeQuestion } = this.props
    this.setState({ fadeout: true })
    setTimeout(() => {
      // store.dispatcher.permanentRemove(model)
      removeQuestion(model)
      if (this.isMounted()) {
        this.setState({ fadeout: false })
      }
    }, 400)
  }

  render () {
    const { fadeout } = this.state
    const style = { opacity: fadeout ? 0 : 1 }
    return (
      <div className={`${styles.pagebreak} ${buttons.buttons}`} style={style}>
        <div className={styles.line}>
          <span className={styles.caption}>Page Break</span>
        </div>
        <Buttons {...this.props} up={styles.moveUp} remove={this.remove} />
      </div>
    )
  }
}

export default PageBreak
