import { Checkbox } from 'antd'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import ChoicesInput from '~/modules/reports/components/ChoicesInput'

const Properties = ({ modules }) => {
  const model = modules[0]
  const { props } = model

  const updateAll = (cb) => {
    modules.forEach((module) => {
      cb(module)
      module.update()
    })
  }

  const checkboxHandler = (type, e) => {
    updateAll((model) => {
      model.props[type] = e.target.checked
    })
  }

  const changeProperty = (propertyName, value) => {
    updateAll((item) => {
      item.props[propertyName] = value
    })
  }

  const changeRadarSize = (value) => {
    updateAll((item) => {
      item.props.radarSize = `${value}%`
    })
  }

  const {
    radarMax, radarSize, tickInterval, startAngle,
  } = props

  return (
    <div>
      <hr className={styles.divider} />
      <div className={styles.block}>

        <Checkbox
          checked={model.props.hideYaxisLabels || false}
          onChange={e => checkboxHandler('hideYaxisLabels', e)}
          className="font-normal"
        >
          Hide Y Axis Labels
        </Checkbox>
      </div>
      <div className={styles.block}>
        <Checkbox
          checked={model.props.hideEmptyFilters || false}
          onChange={e => checkboxHandler('hideEmptyFilters', e)}
          className="font-normal"
        >
          Hide Empty Filters
        </Checkbox>
      </div>
      <div className={styles.block}>
        <Checkbox
          checked={model.props.showLegend || false}
          onChange={e => checkboxHandler('showLegend', e)}
          className="font-normal"
        >
          {I18n.t('reports.builder.graph.properties.showLegend')}
        </Checkbox>
      </div>
      <div className={styles.block}>
        Radar Maximum
        <ChoicesInput
          value={radarMax}
          onChange={e => changeProperty('radarMax', e)}
          minValue={2}
          maxValue={30}
        />
      </div>
      <hr className={styles.divider} />
      <div className={styles.block}>
        Radar Size
        <ChoicesInput
          value={parseInt(radarSize, 10)}
          onChange={changeRadarSize}
          minValue={50}
          maxValue={150}
        />
      </div>
      <hr className={styles.divider} />
      <div className={styles.block}>
        Tick Interval
        <ChoicesInput
          value={tickInterval}
          onChange={e => changeProperty('tickInterval', e)}
          minValue={0}
          maxValue={5}
        />
      </div>
      <hr className={styles.divider} />
      <div className={styles.block}>
        Start Angle
        <ChoicesInput
          value={startAngle || 0}
          onChange={e => changeProperty('startAngle', e)}
          minValue={0}
          maxValue={90}
        />
      </div>
    </div>
  )
}

export default Properties
