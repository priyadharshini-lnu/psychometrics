import React from 'react'
import cs from 'classnames'
import FilterAvatar from './FilterAvatar'
import styles from './styles.scss'

export default function Legend ({ filters, model }) {
  const { showLabels } = model.props
  return (
    <div className={cs('mm', styles.legend)}>
      {filters.map(filter => (
        <div className={cs('mrl', styles.legendItem)} key={filter.id}>
          <FilterAvatar filter={filter} fontSize={12} showLabel={showLabels} />
          <div className={cs('mls', styles.legendItemName)} style={{ color: filter.color }}>{filter.name}</div>
        </div>
      ))}
    </div>
  )
}
