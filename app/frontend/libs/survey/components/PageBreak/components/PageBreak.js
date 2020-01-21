import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Buttons from 'views/Question/components/Buttons'
import buttons from 'views/Question/components/Buttons.scss'
import styles from './PageBreak.scss'

class PageBreak extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  remove = () => {
    const { model, block, removeQuestion } = this.props
    removeQuestion(block, model)
  }

  render () {
    return (
      <div className={`${styles.pagebreak} ${buttons.buttons}`}>
        <div className={styles.line}>
          <span className={styles.caption}>Page Break</span>
        </div>
        <Buttons {...this.props} up={styles.moveUp} remove={this.remove} />
      </div>
    )
  }
}

export default PageBreak
