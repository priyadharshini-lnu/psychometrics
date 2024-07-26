import _ from 'lodash'
import { useContext } from 'react'
import { Radio, Checkbox, Space } from 'antd'
import cs from 'classnames'
import { MediaQueryContext } from '~/glint'

import styles from './Likert.less'

const SingleAnswerPreview = ({ model, I18n, readOnly }) => {
  const { isMobile } = useContext(MediaQueryContext)
  const {
    result, props, moduleConfig,
  } = model
  const { notApplicable, answersType } = props
  const InputComponent = props.answersType === 'SingleAnswer' ? Radio : Checkbox

  const changeValue = (scale, choice, e) => {
    if (result.notApplicable && result.notApplicable[choice]) {
      result.notApplicable[choice] = false
    }
    result.answer(scale, choice, e.target.checked)
  }

  const changeNotApplicable = (choice) => {
    _.remove(result.answers, { choice })
    result.notApplicable = result.notApplicable || {}
    result.notApplicable[choice] = true
    result.reduxAnswer()
  }

  const notApplicableHeader = notApplicable
    ? (
      <span
        id={`notApplicable-${result.questionId}`}
        className={styles.scalePointItem}
      >
        {I18n.tQuestion(model, 'notApplicableLabel')}
      </span>
    ) : null


  if (isMobile) {
    return (
      <Space size={10} direction="vertical" className="w-100">
        {_.times(props.choices, choice => (
          <div key={choice} className={cs(styles.choiceSm, 'pt-1')}>
            <div key={choice} id={`${result.questionId}-choice-${choice}`}>
              {I18n.tQuestion(model, `choicesTexts${choice + 1}`, { choice })
                  || moduleConfig.defaultChoiceText(choice + 1)}
            </div>
            <Space size={8} direction="vertical">
              {_.times(props.scalePoints, (scale) => {
                const object = _.find(result.answers, { scale, choice }) || {}
                return (
                  <div key={scale}>
                    {props.labels > 0
                    && (
                    <div id={`${result.questionId}-label-${scale}`} className={styles.labelItem}>
                      {props.labelsTexts[scale] || moduleConfig.defaultLabelText(scale + 1)}
                    </div>
                    )}
                    <Space size={0}>
                      <InputComponent
                        disabled={readOnly}
                        checked={object.value || false}
                        onChange={e => changeValue(scale, choice, e)}
                        // eslint-disable-next-line max-len
                        aria-describedby={`${result.questionId}-choice-${choice} ${result.questionId}-label-${scale} ${result.questionId}-scalepoint-${scale}`}
                      />
                      <span id={`${result.questionId}-scalepoint-${scale}`} className={styles.scalePointItem}>
                        {I18n.tQuestion(model, `scalePointsTexts${scale + 1}`, { scale })
                        || moduleConfig.defaultScalePointText(scale + 1)}
                      </span>
                    </Space>
                  </div>
                )
              })}
              <Space size={0}>
                <NotApplicableCheckbox
                  result={result}
                  choice={choice}
                  answersType={answersType}
                  notApplicable={notApplicable}
                  readOnly={readOnly}
                  changeNotApplicable={changeNotApplicable}
                />
                {notApplicableHeader}
              </Space>
            </Space>
          </div>
        ))}
      </Space>
    )
  }

  return (
    <div className={styles.table}>
      <div className={`${styles.row} ${styles.labels}`}>
        <div className={styles.firstColumn} />
        <div className={styles.labelItems}>
          {_.times(props.labels, i => (
            <div key={i} id={`${result.questionId}-label-${i}`}>
              {props.labelsTexts[i] || moduleConfig.defaultLabelText(i + 1)}
            </div>
          ))}
        </div>
      </div>
      <div className={`${styles.row} ${styles.header}`}>
        <div className={styles.firstColumn} />
        <div className={styles.scalePoints}>
          {_.times(props.scalePoints, i => (
            <span key={i} className={styles.scalePointItem} id={`${result.questionId}-scalepoint-${i}`}>
              {I18n.tQuestion(model, `scalePointsTexts${i + 1}`, { scale: i })
                  || moduleConfig.defaultScalePointText(i + 1)}
            </span>
          ))}
          {notApplicableHeader}
        </div>
      </div>

      {_.times(props.choices, choice => (
        <div key={choice} className={styles.row}>
          <div className={styles.firstColumn}>
            <div className={styles.item}>
              <div key={choice} id={`${result.questionId}-choice-${choice}`}>
                {I18n.tQuestion(model, `choicesTexts${choice + 1}`, { choice })
                    || moduleConfig.defaultChoiceText(choice + 1)}
              </div>
            </div>
          </div>
          <div className={styles.inputs}>
            {_.times(props.scalePoints, (scale) => {
              const object = _.find(result.answers, { scale, choice }) || {}
              return (
                <InputComponent
                  disabled={readOnly}
                  key={scale}
                  checked={object.value || false}
                  onChange={e => changeValue(scale, choice, e)}
                  // eslint-disable-next-line max-len
                  aria-describedby={`${result.questionId}-choice-${choice} ${result.questionId}-label-${scale} ${result.questionId}-scalepoint-${scale}`}
                />
              )
            })}
            <NotApplicableCheckbox
              result={result}
              choice={choice}
              answersType={answersType}
              notApplicable={notApplicable}
              readOnly={readOnly}
              changeNotApplicable={changeNotApplicable}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

const NotApplicableCheckbox = ({
  result, choice, answersType, notApplicable, readOnly, changeNotApplicable,
}) => {
  const InputComponent = answersType === 'SingleAnswer' ? Radio : Checkbox
  if (!notApplicable) { return null }
  const checked = result.notApplicable && result.notApplicable[choice]
  return (
    <div>
      <InputComponent
        disabled={readOnly}
        onChange={e => changeNotApplicable(choice, e)}
        checked={checked || false}
        aria-describedby={`${result.questionId}-choice-${choice} notApplicable-${result.questionId}`}
      />
    </div>
  )
}

export default SingleAnswerPreview
