import React from 'react'
import _ from 'lodash'
import styles from '../../Condition.scss'

const KEY_OPTIONS = [
  { value: 'zip_code', label: 'Postal Code' },
  { value: 'city', label: 'City' },
  { value: 'region_name', label: 'State/Region' },
  { value: 'country_name', label: 'Country Name' },
  { value: 'country_code', label: 'Country Code' },
]

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

export default GeoIPPreview
