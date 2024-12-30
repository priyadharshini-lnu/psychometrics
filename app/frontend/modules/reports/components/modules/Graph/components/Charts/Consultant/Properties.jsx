import { Slider, Checkbox } from 'antd'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import ChoicesInput from '~/modules/reports/components/ChoicesInput'

const Properties = ({ modules }) => {
  const model = modules[0]
  const { radarMax, numberOfDecimals, valuePadding } = model.props

  const update = () => {
    modules.forEach((module) => {
      module.update()
    })
  }

  const updateAll = (cb) => {
    modules.forEach((module) => {
      cb(module)
      module.update()
    })
  }

  const changeProperty = (propertyName, value) => {
    updateAll((item) => {
      item.props[propertyName] = value
    })
  }

  const changeNumberOfDecimals = (value) => {
    updateAll((item) => {
      item.props.numberOfDecimals = value
    })
  }

  const changeValuePadding = (value) => {
    updateAll((item) => {
      item.props.valuePadding = value
    })
  }

  const changeShowLegend = (e) => {
    updateAll((item) => {
      item.props.showLegend = e.target.checked
    })
  }
  const updateValuePadding = () => {
    update()
  }

  return (
    <div>
      <div className={styles.block}>
        Radar Maximum
        <ChoicesInput
          value={radarMax}
          onChange={e => changeProperty('radarMax', e)}
          minValue={5}
          maxValue={10}
        />
      </div>
      <hr className={styles.divider} />
      <div className={styles.block}>
        Number of Decimals
        <ChoicesInput
          maxValue={3}
          value={numberOfDecimals}
          onChange={changeNumberOfDecimals}
        />
      </div>
      <hr className={styles.divider} />
      <div className={styles.block}>
        <Checkbox
          checked={model.props.showLegend || false}
          onChange={changeShowLegend}
          className="font-normal"
        >
          {I18n.t('reports.builder.graph.properties.showLegend')}
        </Checkbox>
      </div>
      <div className={styles.block}>
        Values Padding
        {' '}
        {valuePadding || 0}
        <Slider
          defaultValue={0}
          min={-50}
          max={50}
          value={valuePadding}
          onChange={changeValuePadding}
          onAfterChange={updateValuePadding}
        />
      </div>
      <hr className={styles.divider} />
    </div>
  )
}

export default Properties
