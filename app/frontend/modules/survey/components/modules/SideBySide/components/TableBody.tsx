import { ChangeEvent, Component } from 'react'
import _ from 'lodash'
import { Input } from 'antd'

import { BuilderModel } from '~/modules/survey/interfaces/questions/SideBySide'

import LabelEditor from '~/modules/survey/components/LabelEditor'

import styles from '../styles.less'

interface Props {
  model: BuilderModel
}

export class TableBody extends Component<Props> {
  changeLabel = (i, text) => {
    const { model } = this.props
    model.changeArrayProps({ collection: 'choicesTexts', i, val: text })
    this.forceUpdate()
  }

  update = () => {
    this.forceUpdate()
  }

  handleRowDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>, index: number) => {
    const { target: { value } } = event
    const { model } = this.props
    model.changeArrayProps({ collection: 'rowDescriptions', i: index, val: value }, false)
    this.update()
  }

  renderInput (data, scalePoint, choice) {
    if (data.type === 'Text' && data.textType === 'Essay') {
      return <textarea className={styles.Essay} />
    }

    return (
      <input
        name={`answers_${scalePoint}_${choice}`}
        className={styles[data.textType]}
        defaultValue=""
        type={
          // eslint-disable-next-line no-nested-ternary
          data.type === 'Likert'
            ? data.likertType === 'SingleAnswer'
              ? 'radio'
              : 'checkbox'
            : 'text'
        }
      />
    )
  }

  renderInputs (data, scalePoint, i) {
    return _.times(data.answers, j => (
      <div className={styles.input} key={j}>
        {this.renderInput(data, scalePoint, i)}
      </div>
    ))
  }

  renderDropdown (data) {
    const {
      model: { moduleConfig },
    } = this.props
    return (
      <select className={styles.select}>
        <option />
        {_.times(data.answers, j => (
          <option className={styles.input} key={j}>
            {data.answersTexts[j] || moduleConfig.defaultAnswerText(j + 1)}
          </option>
        ))}
      </select>
    )
  }

  renderHeaders (index) {
    const {
      model: { props, moduleConfig },
    } = this.props
    const data = props.columnsData
    const length = props.choices
    const none = props.repeatHeaders === 'None'
    const middle = props.repeatHeaders === 'Middle'
    const bottom = props.repeatHeaders === 'Bottom'
    const both = props.repeatHeaders === 'Both'
    const last = typeof index === 'undefined'

    if (bottom || both) {
      if (bottom && !last) {
        return
      }
      if (both) {
        if (!last && index !== Math.ceil(length / 2)) {
          return
        }
      }
    } else {
      if (index === 0 || none) {
        return
      }
      if (middle && index !== Math.ceil(length / 2)) {
        return
      }
    }

    return (
      <tr className={styles.answersRow} key={`header-${index}`}>
        <td
          className={`${styles.header} ${styles.column} ${styles.firstColumn} ps-2 pe-2 pt-2 pb-2`}
        />
        {_.times(props.scalePoints, i => (
          <td key={i} className={`${styles.column} ps-2 pe-2 pt-2 pb-2`}>
            <div className={styles.answers}>
              {_.times(data[i].answers, j => (
                <div className={styles.answer} key={j}>
                  <span>
                    {data[i].answersTexts[j]
                      || moduleConfig.defaultAnswerText(j + 1)}
                  </span>
                </div>
              ))}
            </div>
          </td>
        ))}
      </tr>
    )
  }

  render () {
    const {
      model: { props, moduleConfig },
    } = this.props
    const data = props.columnsData
    const { isRowDescriptionEnabled } = props

    return (
      <tbody>
        {_.times(props.choices, i => [
          this.renderHeaders(i),
          <tr className={styles.mainRow} key={i}>
            <td className={`${styles.firstColumn} ps-2 pe-2 pt-2 pb-2`}>
              <LabelEditor
                onChange={e => this.changeLabel(i, e)}
                maxWidth="100%"
                value={
                  props.choicesTexts[i] || moduleConfig.defaultChoiceText(i + 1)
                }
              />
              {isRowDescriptionEnabled && (
                <Input.TextArea
                  rows={2}
                  defaultValue={props?.rowDescriptions?.[i] ?? ''}
                  onBlur={event => this.handleRowDescriptionChange(event, i)}
                />
              )}
            </td>
            {_.times(props.scalePoints, (scalePoint) => {
              const dropdown = data[scalePoint].type === 'Likert'
                && data[scalePoint].likertType === 'DropDown'
              return (
                <td key={scalePoint} className={`${styles.column} ps-2 pe-2 pt-2 pb-2`}>
                  <div
                    className={`${styles.inputs} ${
                      dropdown ? styles.dropdowns : ''
                    }`}
                  >
                    {dropdown
                      ? this.renderDropdown(data[scalePoint])
                      : this.renderInputs(data[scalePoint], scalePoint, i)}
                  </div>
                </td>
              )
            })}
          </tr>,
        ])}
        {this.renderHeaders(undefined)}
      </tbody>
    )
  }
}

export default TableBody
