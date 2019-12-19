import _ from 'lodash'
import React from 'react'
import I18nStore from 'store/I18nStore'
import Container from './Container'
import styles from '../DragAndDrop.scss'

const PickGroupPreview = ({ model, readOnly }) => {
  const columns = model.props.columns ? styles.columns : ''

  const groupedAnswers = _.groupBy(model.result.answers, 'scale')
  const groupedValues = _.flatten(_.values(groupedAnswers))
  const selectedChoices = _.map(groupedValues, ({ choice }) => choice)

  let notSelectedChoices = _.times(model.props.choices, (i, index) => {
    if (_.includes(selectedChoices, i)) { return null }
    return { choice: i, value: index }
  })
  notSelectedChoices = _.compact(notSelectedChoices)

  return (
    <div className={`${styles.table} ${styles.preview}`}>
      <div className={styles.row}>
        <div className={`${styles.column} ${styles.defaultGroup}`}>
          <div className={styles.items}>
            <Container
              readOnly={readOnly}
              model={model}
              questionId={model.id}
              key={-1}
              id={-1}
              cards={notSelectedChoices || []}
              text={I18nStore.t('assessments.pickgrouprank.items')}
              stacked={model.props.stackItems}
            />
          </div>
        </div>
        <div className={`${styles.column} ${styles.groups} ${columns}`}>
          {_.times(model.props.scalePoints, (groupId) => {
            const text = I18nStore.tQuestion(model, `scalePointsTexts${groupId + 1}`, { scale: groupId })
              || model.moduleConfig.defaultScalePointText(groupId + 1)
            return (
              <Container
                readOnly={readOnly}
                text={text}
                model={model}
                questionId={model.id}
                key={groupId}
                id={groupId}
                cards={groupedAnswers[groupId] || []}
                stacked={model.props.stackItemsGroup}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PickGroupPreview
