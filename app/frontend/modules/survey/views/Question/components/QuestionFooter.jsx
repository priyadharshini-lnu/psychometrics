import { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './Question.less'
import SkipLogic from './SkipLogic'

class QuestionFooter extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  renderSkipLogic () {
    return (
      <div>
        <SkipLogic {...this.props} />
      </div>
    )
  }

  render () {
    return (
      <div className={styles.footer}>
        {this.renderSkipLogic()}
      </div>
    )
  }
}

export default QuestionFooter
