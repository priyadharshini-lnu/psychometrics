import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import StarBar from '~/modules/survey/components/StarBar'
import styles from './Star.less'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeValue = (i, value) => {
    const { readOnly, model } = this.props
    if (readOnly) { return }
    model.result.answer(i, value, 1)
    this.forceUpdate()
  }

  render () {
    const { model, model: { props, moduleConfig, result }, I18n } = this.props
    return (
      <div className={styles.table}>
        {_.map(model.choicesIds, (i) => {
          const object = _.find(result.answers, { index: i }) || {}
          return (
            <div key={i} className={styles.row}>
              <div className={styles.firstColumn}>
                <span>
                  {I18n.tQuestion(model, `choicesTexts${i + 1}`, { choice: i })
                  || moduleConfig.defaultChoiceText(i + 1)}
                </span>
              </div>
              <StarBar
                stars={props.stars}
                value={object.value || 0}
                type={props.interaction}
                onClick={e => this.changeValue(i, e)}
              />
              <div className={styles.lastColumn}>
                <span>{object.value || 0}</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}
