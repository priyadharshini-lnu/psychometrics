import _ from 'lodash'
import React from 'react'
import styles from './Branch.scss'
import ConditionPreview from './ConditionPreview'

const ConditionListPreview = ({ model, model: { props: { conditions } } }) => (
  <div className={styles.logicList}>
    {_.map(conditions, (condition, i) => (
      <ConditionPreview key={i} model={model} condition={condition} />
    ))}
  </div>
)

export default ConditionListPreview
