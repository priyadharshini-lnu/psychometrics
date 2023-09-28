import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import { Select } from 'antd'

import styles from '../../styles.less'
import { NOT_APPLICABLE } from '../../../MatrixTable/components/Consts'

class DropdownPreview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeAnswer = (value) => {
    const { model } = this.props
    if (value === NOT_APPLICABLE) {
      model.result.answers = []
      model.result.notApplicable = true
      model.result.reduxAnswer()
    } else {
      model.result.notApplicable = false
      model.result.answer(parseInt(value, 10))
    }
    this.forceUpdate()
  }

  notApplicableOption () {
    const { model, I18n } = this.props
    const { notApplicable } = model.props
    if (!notApplicable) { return [] }
    return {
      value: NOT_APPLICABLE,
      label: I18n.tQuestion(model, 'notApplicableLabel'),
    }
  }

  render () {
    const {
      model, model: { moduleConfig, result }, readOnly, I18n,
    } = this.props
    const value = _.get(result, ['answers', 0, 'index'], (result.notApplicable && NOT_APPLICABLE))
    return (
      <div>
        <Select
          className={styles.dropdown}
          listItemHeight={0}
          showSearch
          disabled={readOnly}
          optionFilterProp="label"
          onChange={this.changeAnswer}
          value={value}
          options={model.choicesIds.map(i => ({
            value: i,
            label: I18n.tQuestion(model, `choicesTexts${i + 1}`, { choice: i })
              || moduleConfig.defaultChoiceText(i + 1),
          })).concat(this.notApplicableOption())}
        />
      </div>
    )
  }
}

export default DropdownPreview
