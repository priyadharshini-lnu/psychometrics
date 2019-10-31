import _ from 'lodash'
import React from 'react'
import LabelEditor from 'components/LabelEditor'
import styles from '../MultipleChoice.scss'

export default function Editable ({ model, onChange, endEdit }) {
  const changeLabel = (i, text) => {
    model.changeArrayProps({ collection: 'choicesTexts', i, val: text })
    onChange && onChange()
  }

  const changeNotApplicableLabel = (value) => {
    model.changeProps({ notApplicableLabel: value })
  }

  const renderNotApplicable = () => {
    const { notApplicable, notApplicableLabel } = model.props
    if (!notApplicable) { return null }
    return (
      <div>
        <LabelEditor
          value={notApplicableLabel}
          onChange={changeNotApplicableLabel}
        />
      </div>
    )
  }

  const module = model.moduleConfig
  return (
    <div>
      <ul className={styles.list}>
        {_.times(model.props.choices, i => (
          <li className={styles.listItem} key={i}>
            <LabelEditor
              value={model.props.choicesTexts[i] || module.defaultChoiceText(i + 1)}
              onChange={val => changeLabel(i, val)}
            />
          </li>
        ))}
        {renderNotApplicable()}
      </ul>
      <a onClick={() => endEdit()}>Back to preview</a>
    </div>
  )
}
