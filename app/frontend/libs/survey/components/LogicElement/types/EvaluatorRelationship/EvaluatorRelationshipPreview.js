import React from 'react'
import PropTypes from 'prop-types'
import styles from '../../Condition.scss'

const EvaluatorRelationshipPreview = ({ condition }) => (
  <div className={styles.questionDock}>
    <span className={styles.mute}>{condition.predicate}</span>
    <span className={styles.highlight}>{condition.value || ''}</span>
  </div>
)

EvaluatorRelationshipPreview.propTypes = {
  condition: PropTypes.object.isRequired,
}

export default EvaluatorRelationshipPreview
