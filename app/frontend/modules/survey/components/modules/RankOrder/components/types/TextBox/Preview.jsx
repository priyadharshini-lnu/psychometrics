import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './TextBox.less'
import DescriptionPreview from '../../DescriptionPreview'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeValue = (index, e) => {
    const { model } = this.props
    model.result.answer(index, parseInt(e.currentTarget.value, 10))
    this.forceUpdate()
  }

  render () {
    const {
      readOnly, model, model: {
        id, props, result, moduleConfig,
      }, I18n,
    } = this.props
    return (
      <div className={styles.table}>
        {_.times(props.choices, (i) => {
          const object = _.find(result.answers, { index: i }) || {}
          return (
            <div key={i} className={styles.row}>
              <div className={styles.item}>
                <input
                  id={`${id}-choice-${i}`}
                  key={i}
                  disabled={readOnly}
                  type="text"
                  className={styles.input}
                  value={object.value || ''}
                  onChange={e => this.changeValue(i, e)}
                />
                <div className={styles.item}>
                  <div>
                    <label htmlFor={`${id}-choice-${i}`} className="font-normal mb-0">
                      {I18n.tQuestion(model, `choicesTexts${i + 1}`, { choice: i })
                      || moduleConfig.defaultChoiceText(i + 1)}
                    </label>
                    {props.showDescription && (
                      <DescriptionPreview
                        description={I18n.tQuestion(model, `descriptionTexts${i + 1}`, { choice: i })}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}
