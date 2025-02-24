import FilterAvatar from './FilterAvatar'
import styles from './styles.less'
import I18nStore from '~/modules/reports/store/I18nStore.js'

export default function Legend ({ filters, model }) {
  const { showLabels } = model.props
  return (
    <div className={styles.legend} data-legend>
      {filters.map(filter => (
        <div className={styles.legendItem} key={filter.id}>
          <FilterAvatar filter={filter} fontSize={0.7} showLabel={showLabels} />
          <div className={styles.legendItemName} style={{ color: filter.color }}>{I18nStore.tFilterName(filter)}</div>
        </div>
      ))}
    </div>
  )
}
