import styles from './DataSheet.less'

const PREDICATE = {
  IsSameAsSubject: 'Is Same as Subject',
  EqualTo: 'Equal To',
  NotEqualTo: 'Not Equal To',
  GreaterThen: 'Greater Than',
  GreaterThenOrEqual: 'Greater Than Or Equal To',
  LessThen: 'Less Than',
  LessThenOrEqual: 'Less Than Or Equal To',
}

const EmbeddedDataPreview = ({ condition }) => (
  <div className={styles.datasheet}>
    <span className={styles.highlight}>{condition.subject || ''}</span>
    <span className={styles.mute}>Is</span>
    <span className={styles.highlight}>{PREDICATE[condition.predicate]}</span>
    <span className={styles.highlight}>{condition.value || ''}</span>
  </div>
)

export default EmbeddedDataPreview
