import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './RadioButtons.less'
import DescriptionPreview from '../../DescriptionPreview'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeValue = (index, value) => {
    const { model } = this.props
    model.result.answer(index, value)
    this.forceUpdate()
  }

  render () {
    const {
      readOnly, model, model: { props, moduleConfig, result }, I18n,
    } = this.props
    return (
      <div className={styles.table}>
        <div className={styles.row}>
          <div className={styles.firstColumn} />
          <div className={styles.inputs}>
            {_.times(props.choices, i => (
              <div key={i} className={styles.radio}>
                <span className={styles.item}>{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
        {_.times(props.choices, (i) => {
          const object = _.find(result.answers, { index: i }) || {}
          return (
            <div key={i} className={styles.row}>
              <div className={styles.firstColumn}>
                <div className={styles.item}>
                  <span>
                    {I18n.tQuestion(model, `choicesTexts${i + 1}`, { choice: i })
                      || moduleConfig.defaultChoiceText(i + 1)}
                  </span>
                  {props.showDescription && (
                    <DescriptionPreview
                      description={I18n.tQuestion(model, `descriptionTexts${i + 1}`, { choice: i })}
                    />
                  )}
                </div>
              </div>
              <div className={styles.inputs}>
                {_.times(props.choices, j => (
                  <div key={j} className={styles.radio}>
                    <input
                      disabled={readOnly}
                      checked={object.value === j}
                      onChange={this.changeValue.bind(this, i, j)}
                      type="radio"
                      className={styles.input}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}
