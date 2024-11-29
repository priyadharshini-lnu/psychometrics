import DataSource from '~/modules/reports/components/DataSourceMenu'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import PropertyFilter from '~/modules/reports/components/PropertyFilter'

const Properties = ({ modules }) => {
  const model = modules[0]

  const changeHeader = () => {
    modules.forEach((item) => {
      item.props.showHeader = !item.props.showHeader
      item.update()
    })
  }

  const update = () => {
    modules.forEach((item) => {
      item.update()
    })
  }

  return (
    <div>
      <div className={styles.title}>Factor - Questions Mean Score Props</div>
      <DataSource modules={modules} onSelect={update} />
      <PropertyFilter modules={modules} />
      <div className={styles.block}>
        <div className="margin-top-10">
          <label className={styles.inputLabel}>
            <input
              style={{ marginRight: '5px' }}
              type="checkbox"
              checked={model.props.showHeader || false}
              onChange={changeHeader}
            />
            Show Header
          </label>
        </div>
      </div>
      <hr className={styles.divider} />
    </div>
  )
}

export default Properties
