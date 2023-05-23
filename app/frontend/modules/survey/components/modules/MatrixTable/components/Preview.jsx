import { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import { SafeHTML } from '~/components/SafeHTML'
import styles from './MatrixTable.less'
import Previews from './Previews'
import connect from '../connect'
import { ScoringTable } from '../../MultipleChoice/components/ScoringTable'

export class Preview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  renderMatrixTypes () {
    const { model, readOnly } = this.props
    const { type } = model.props
    const View = Previews[type]
    return <View model={model} preview readOnly={readOnly} />
  }

  renderScoring () {
    const {
      factors, scores, I18n,
    } = this.props

    if (!scores || !_.size(scores)) { return null }

    return (
      <div>
        <ScoringTable factors={factors} scoring={scores} I18n={I18n} />
      </div>
    )
  }

  render () {
    const { model, I18n, showQuestionScoring } = this.props
    return (
      <div>
        <SafeHTML
          className={styles.questionTextPreview}
          html={I18n.tQuestion(model, 'questionText')}
          config="adminRichText"
        />
        {this.renderMatrixTypes()}
        {showQuestionScoring && this.renderScoring()}
      </div>
    )
  }
}

export default connect(Preview)
