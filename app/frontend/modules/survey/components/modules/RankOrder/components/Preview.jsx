import { Component } from 'react'
import PropTypes from 'prop-types'

import { SafeHTML } from '~/components/SafeHTML'

import styles from './RankOrder.less'
import Previews from './Previews'
import connect from '../connect'

export class Preview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  componentDidMount () {
    const { model } = this.props
    model.result.reduxAnswer()
  }

  renderAnswersType () {
    const { model, readOnly } = this.props
    const { type } = model.props
    const View = Previews[type]
    return <View model={model} preview readOnly={readOnly} />
  }

  render () {
    const { model, I18n } = this.props
    return (
      <fieldset>
        <legend className="mb-0 border-none">
          <SafeHTML
            className={styles.questionTextPreview}
            html={I18n.tQuestion(model, 'questionText')}
            config="adminRichText"
          />
        </legend>
        {this.renderAnswersType()}
      </fieldset>
    )
  }
}

export default connect(Preview)
