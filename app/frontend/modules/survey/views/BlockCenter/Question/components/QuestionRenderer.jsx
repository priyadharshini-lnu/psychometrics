import { Component } from 'react'
import PropTypes from 'prop-types'
import QuestionSerializer from '~/modules/survey/models/QuestionSerializer'
import { Modules } from '~/modules/survey/components/modules'
import styles from './Question.less'

class QuestionRenderer extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  renderModule () {
    const { model } = this.props
    const View = Modules[model.type] || Modules.MultipleChoice
    return <View {...this.props} model={QuestionSerializer.wrap(model)} />
  }

  render () {
    return (
      <div className={styles.contentOuter}>
        {this.renderModule()}
      </div>
    )
  }
}

export default QuestionRenderer
