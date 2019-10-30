import React from 'react'
import _ from 'lodash'
import cs from 'classnames'
import styles from './styles.scss'
import FilterAvatar from '../../FilterAvatar'

export default function MilestoneTd ({
  milestoneIndex, milestone: { min, max }, results, model, filters,
}) {
  const { showLines } = model.props
  const filteredResults = results.filter(
    r => ((milestoneIndex === 0 && r.value >= parseFloat(min))
      || r.value > parseFloat(min)) && r.value <= parseFloat(max),
  )

  const keyedResults = _.keyBy(filteredResults, 'id')
  const positionByValue = value => (parseFloat(value) - parseFloat(min)) * 100 / (parseFloat(max) - parseFloat(min))

  return (
    <td className={styles.td}>
      <div className={styles.filters}>
        {filters.map((filter) => {
          const result = _.get(keyedResults, filter.id, false)
          const position = result ? positionByValue(result.value) : 0
          return (
            <div className={cs(styles.filter, { [styles.noLines]: !showLines })} key={filter.id}>
              {result && (
                <FilterComponent
                  key={filter.id}
                  filter={keyedResults[filter.id]}
                  model={model}
                  style={{ left: `${position}%`, transform: `translateX(-${position}%)` }}
                />
              )}
            </div>
          )
        })}
        <div className={styles.filter} />
      </div>
    </td>
  )
}

function FilterComponent ({ filter, model, style }) {
  const { showLabels, showValues } = model.props
  const fontSize = showLabels || showValues ? 10 : 8
  style.bottom = `${-fontSize}px`
  return (
    <div className={styles.container} style={style}>
      <FilterAvatar filter={filter} fontSize={fontSize} showLabel={showLabels} />
      {showValues && <div className={styles.value}>{filter.value}</div>}
    </div>
  )
}
