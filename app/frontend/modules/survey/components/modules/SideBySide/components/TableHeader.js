import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LabelEditor from 'components/LabelEditor'
import Action from 'undo'
import styles from './SideBySide.scss'
import Menu from './Menu'

export class TableHeader extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  changeLabel = (i, value, undo) => {
    const { model } = this.props
    const oldValue = [i, model.props.columnsData[i].text]
    model.props.columnsData[i].text = value
    const newValue = [i, model.props.columnsData[i].text]
    if (!undo) {
      Action('SideBySideChangeGroup', this, { oldValue, newValue })
    }
    model.update()
    this.forceUpdate()
  }

  changeAnswer = (i, j, value, undo) => {
    const { model } = this.props
    const data = model.props.columnsData[i]
    const oldValue = [i, j, data.answersTexts[j]]
    data.answersTexts[j] = value
    const newValue = [i, j, data.answersTexts[j]]
    if (!undo) {
      Action('SideBySideChangeAnswer', this, { oldValue, newValue })
    }
    model.update()
    this.forceUpdate()
  }

  update = () => {
    const { onChange } = this.props
    onChange && onChange()
  }

  render () {
    const { model: { props, moduleConfig } } = this.props
    const data = props.columnsData
    return (
      <thead className={styles.tableHead}>
        <tr className={styles.controlsRow}>
          <th className={`${styles.column} ${styles.firstColumn} ${styles.controls}`} />
          {_.times(props.scalePoints, i => (
            <th key={i} className={styles.column}>
              <div className={styles.controls}>
                <Menu {...this.props} index={i} data={props.columnsData[i]} onChange={this.update} />
              </div>
            </th>
          ))}
        </tr>
        <tr className={styles.row}>
          <td className={`${styles.group} ${styles.column} ${styles.firstColumn}`} />
          {_.times(props.scalePoints, i => (
            <td key={i} className={styles.column}>
              <div className={styles.group}>
                <LabelEditor
                  onChange={e => this.changeLabel(i, e)}
                  maxWidth={200}
                  value={data[i].text || moduleConfig.defaultGroupText(i + 1)}
                />
              </div>
            </td>
          ))}
        </tr>
        <tr className={styles.answersRow}>
          <th className={`${styles.header} ${styles.column} ${styles.firstColumn}`} />
          {_.times(props.scalePoints, i => (
            <th key={i} className={styles.column}>
              <div className={styles.answers}>
                {_.times(data[i].answers, j => (
                  <div className={styles.answer} key={j}>
                    <LabelEditor
                      onChange={e => this.changeAnswer(i, j, e)}
                      maxWidth="100%"
                      value={data[i].answersTexts[j] || moduleConfig.defaultAnswerText(j + 1)}
                    />
                  </div>
                ))}
              </div>
            </th>
          ))}
        </tr>
      </thead>
    )
  }
}

export default TableHeader
