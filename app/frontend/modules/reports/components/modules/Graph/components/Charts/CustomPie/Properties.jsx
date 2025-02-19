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

  const changeProperty = (propertyName, value) => {
    updateAll((item) => {
      item.props[propertyName] = value
    })
  }

  const changeBorderWidth = (value) => {
    updateAll((item) => {
      item.props.chartBorderWidth = `${value}px`
    })
  }
  const changeShowLegend = (e) => {
    updateAll((item) => {
      item.props.showLegend = e.target.checked
    })
  }

  const hideEmptyFilters = (e) => {
    updateAll((item) => {
      item.props.hideEmptyFilters = e.target.checked
    })
  }

  const { chartBorderWidth, radarMax, source } = props

  return (
    <div>
      <div className="margin-bottom-10">Up to 4 items can be displayed</div>
      <hr className={styles.divider} />
      {source?.type === 'CampaignFactors' ? (
        <>
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
        </>
      ) : ''}
      <div className={styles.block}>
        Pie Thickness
        <ChoicesInput
          value={parseInt(chartBorderWidth, 10)}
          onChange={changeBorderWidth}
          minValue={1}
          maxValue={30}
        />
      </div>
      <div className={styles.block}>
        <Checkbox
          checked={model.props.showLegend || false}
          onChange={changeShowLegend}
          className="font-normal"
        >
          {I18n.t('reports.builder.graph.properties.showLegend')}
        </Checkbox>
        <Checkbox
          checked={model.props.hideEmptyFilters || false}
          onChange={hideEmptyFilters}
          className="font-normal"
        >
          {I18n.t('reports.builder.graph.properties.hideEmptyFilters')}
        </Checkbox>
      </div>
    </div>
  )
}

export default Properties
