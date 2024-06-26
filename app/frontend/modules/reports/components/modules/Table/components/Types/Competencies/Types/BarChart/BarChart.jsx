import _ from 'lodash'
import styles from './styles.less'

export default function BarChart ({
  model, filters, milestones,
}) {
  const { showValues } = model.props
  const keyedResults = _.keyBy(filters, 'id')
  const maxValue = (milestones || []).reduce((acc, m) => (parseInt(m.max, 10) > acc ? parseInt(m.max, 10) : acc), 0)
  const widthByValue = value => (parseFloat(value)) / (maxValue || 5) * 100

  return (
    <td className={styles.td} colSpan={milestones.length || 1}>
      <div className={styles.filters}>
        {filters.map((filter) => {
          const result = _.get(keyedResults, filter.id, false)
          const width = (result ? widthByValue(result.value) : 0)
          const style = {
            width: `${width}%`,
            maxHeight: 16,
            backgroundColor: filter.color,
          }
          return (
            <div className={styles.barRow}>
              <div className={styles.bar} style={style} />
              {showValues && <div className={styles.value}>{result.value.toFixed(2)}</div>}
            </div>
          )
        })}
      </div>
    </td>
  )
}
