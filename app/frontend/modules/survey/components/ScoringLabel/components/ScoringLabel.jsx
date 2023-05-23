import Utils from '~/modules/survey/utils'
import styles from './ScoringLabel.less'

const ScoringLabel = ({ value, label, onToggle }) => (
  <div
    onClick={onToggle}
    className={`${styles.container} ${Utils.isNumeric(value) ? styles.fill : styles.empty}`}
  >
    {label}
  </div>
)

export default ScoringLabel
