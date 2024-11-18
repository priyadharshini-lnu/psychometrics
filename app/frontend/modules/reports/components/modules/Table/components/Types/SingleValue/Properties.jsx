import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import PropertyFilter from '~/modules/reports/components/PropertyFilter'
import SourceTypeButtonGroup from '../../SourceTypeButtonGroup'
import dataSources from './dataSources'

const Properties = ({ modules }) => {
  const model = modules[0]

  const onChange = (key, value) => {
    modules.forEach((item) => {
      item.props[key] = value
      item.update()
    })
  }

  const DataSource = dataSources[model.props.sourceType]

  return (
    <div>
      <div className={styles.title}>Single Value</div>
      <SourceTypeButtonGroup model={model} onChange={onChange} />
      <DataSource modules={modules} onChange={onChange} />
      <div className="mtm">
        <PropertyFilter modules={modules} />
      </div>
    </div>
  )
}

export default Properties
