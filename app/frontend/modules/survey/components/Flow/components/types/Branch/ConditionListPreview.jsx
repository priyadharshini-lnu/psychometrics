import _ from 'lodash'
import styles from './Branch.less'
import ConditionPreview from './ConditionPreview'

const ConditionListPreview = ({ model, model: { props: { conditions } } }) => (
  <div className={styles.logicList}>
    {_.map(conditions, (condition, i) => (
      <ConditionPreview key={i} model={model} condition={condition} />
    ))}
  </div>
)

export default ConditionListPreview
