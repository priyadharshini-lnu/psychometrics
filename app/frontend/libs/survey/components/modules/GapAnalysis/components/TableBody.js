import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LabelEditor from 'components/LabelEditor'
import Action from 'undo'
import styles from './GapAnalysis.scss'

export class TableBody extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeLabel = (i, val) => {
    const { model } = this.props
    model.changeArrayProps({ collection: 'choicesTexts', i, val })
    this.update()
  }

  update = () => {
    this.forceUpdate()
  }

  changeData = ({ data, i, val }, undo) => {
    const { model } = this.props
    const oldValue = { data, i, val: data.texts[i] }
    data.texts[i] = val
    const newValue = { data, i, val: data.texts[i] }
    if (!undo) {
      Action('GapAnalysisChangeText', this, { oldValue, newValue })
    }
    model.update()
  }

  changeText = (data, i, val) => {
    this.changeData({ data, i, val })
    this.update()
  }

  renderCheckbox (data, text, i) {
    return (
      <label key={i} className={styles.whylabel}>
        <div>
          <LabelEditor
            onChange={e => this.changeText(data, i, e)}
            maxWidth="100%"
            value={text}
          />
        </div>
        <input type="checkbox" />
      </label>
    )
  }

  render () {
    const { model, model: { props, moduleConfig } } = this.props
    const data = props.categoriesData
    return (
      <tbody>
        {_.times(props.choices, i => (
          <tr className={styles.mainRow} key={i}>
            <td className={styles.firstColumn}>
              <LabelEditor
                onChange={e => this.changeLabel(i, e)}
                maxWidth="100%"
                value={props.choicesTexts[i] || moduleConfig.defaultCategoryText(i + 1)}
              />
            </td>
            {_.times(5, j => (
              <td
                key={j}
                className={`${styles.inputColumn}
                    ${j > 2 ? styles[`inputColumn${j}`] : ''}
                    ${j === 4 ? 'last' : ''}`}
              >
                <label className={styles.inputLabel}>
                  <input name={`rank_${model.id}_${i}`} type="radio" />
                </label>
              </td>
            ))}
            <td className={styles.tellUsInputs}>
              <div className={styles.tellUsLabels}>
                <span className="fa fa-arrow-right" />
                {_.map(data[i].texts, this.renderCheckbox.bind(this, data[i]))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    )
  }
}

export default TableBody
