import { Component } from 'react'
import PropTypes from 'prop-types'
import Buttons from '~/modules/survey/views/Question/components/Buttons'
import buttons from '~/modules/survey/views/Question/components/Buttons.less'
import styles from './PageBreak.less'

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
