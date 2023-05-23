import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import LabelEditor from '~/modules/survey/components/LabelEditor'
import styles from './TextBox.less'
import Description from '../../Description'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  change = (e) => {
    const select = e.currentTarget
    const val = select.value

    _.each(select.options, (option) => {
      if (option.value !== val) {
        option.selected = false
      }
    })
  }

  changeLabel = (i, text) => {
    const { model } = this.props
    model.changeArrayProps({ collection: 'choicesTexts', i, val: text })
    this.forceUpdate()
  }

  render () {
    const { model, model: { props, moduleConfig } } = this.props
    return (
      <div className={styles.table}>
        {_.times(props.choices, i => (
          <div key={i} className={styles.row}>
            <div className={styles.item}>
              <input key={i} type="text" className={styles.input} />
              <div className={styles.item}>
                <div>
                  <LabelEditor
                    onChange={e => this.changeLabel(i, e)}
                    maxWidth={150}
                    value={props.choicesTexts[i] || moduleConfig.defaultChoiceText(i + 1)}
                  />
                  <Description model={model} index={i} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
}
