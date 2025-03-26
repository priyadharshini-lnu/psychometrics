import _ from 'lodash'
import cs from 'classnames'
import I18nStore from '~/modules/reports/store/I18nStore'
import styles from './styles.less'
import FilterAvatar from '../../FilterAvatar'

export default function MilestoneTd ({
  milestoneIndex, milestone: { min, max }, model, filters, columnWidth,
}) {
  const { showLines, scoreBackgroundColor } = model.props
  const filteredResults = filters.filter(
    r => ((milestoneIndex === 0 && r.value >= parseFloat(min))
      || r.value > parseFloat(min)) && r.value <= parseFloat(max),
  )

  const keyedResults = _.keyBy(filteredResults, 'id')
  const positionByValue = value => (parseFloat(value) - parseFloat(min)) * 100 / (parseFloat(max) - parseFloat(min))
  const reverseLabel = value => parseFloat(value) > ((parseFloat(max) + parseFloat(min)) / 2)
  const locale = I18nStore.locale || 'en'
  const direction = locale === 'ar' ? 'right' : 'left'
  return (
    <td className={styles.td} width={`${columnWidth}%`}>
      <div className={styles.filters}>
        {filters.map((filter) => {
          const result = _.get(keyedResults, filter.id, false)
          const position = result ? positionByValue(result.value) : 0
          const translateX = direction === 'left' ? -position : position
          const style = {
            [direction]: `${position}%`,
            transform: `translateX(${translateX}%)`,
            backgroundColor: scoreBackgroundColor,
          }
          return (
            <div className={cs(styles.filter, { [styles.noLines]: !showLines })} key={filter.id}>
              {result && (
                <FilterComponent
                  key={filter.id}
                  filter={keyedResults[filter.id]}
                  model={model}
                  style={style}
                  reversed={reverseLabel(result.value)}
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

function FilterComponent ({
  filter,
  model,
  style,
  reversed,
}) {
  const { showLabels, showValues, precision } = model.props
  const fontSize = 0.65
  const classes = [styles.container, reversed ? styles.reversed : '', showValues ? styles.outline : '']

  style.bottom = `${-fontSize}em`

  return (
    <div className={cs(classes)} style={style}>
      <FilterAvatar filter={filter} fontSize={fontSize} showLabel={showLabels} />
      {showValues && (
        <div className={styles.value} style={{ fontSize: `${fontSize}em` }}>
          {filter.value.toFixed(precision ?? 2)}
        </div>
      )}
    </div>
  )
}
