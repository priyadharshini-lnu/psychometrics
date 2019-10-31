import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { KEY_OPTIONS } from './Constants'
import styles from '../../Condition.scss'

const GeoIPPreview = ({ condition }) => {
  const type = _.find(KEY_OPTIONS, { value: condition.key }) || {}
  const value = condition.value.value || condition.value
  return (
    <div className={styles.questionDock}>
      <span className={styles.highlight}>{type.label}</span>
      <span className={styles.highlight}>{condition.predicate}</span>
      <span className={styles.highlight}>{value}</span>
    </div>
  )
}

GeoIPPreview.propTypes = {
  condition: PropTypes.object.isRequired,
}

export default GeoIPPreview
