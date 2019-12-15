import React from 'react'
import FilterAvatar from './FilterAvatar'
import styles from './styles.scss'

export default function Legend ({ filters, model }) {
  const { showLabels } = model.props
  return (
    <div className={styles.legend}>
      {filters.map(filter => (
        <div className={styles.legendItem} key={filter.id}>
          <FilterAvatar filter={filter} fontSize={12} showLabel={showLabels} />
          <div className={styles.legendItemName} style={{ color: filter.color }}>{filter.name}</div>
        </div>
      ))}
    </div>
  )
}
