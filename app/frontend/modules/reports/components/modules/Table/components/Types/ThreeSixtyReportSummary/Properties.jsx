import PropertyFilter from '~/modules/reports/components/PropertyFilter'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'

const Properties = ({ model }) => (
  <div>
    <div className={styles.title}>360 Report Summary</div>
    <PropertyFilter model={model} />
    <hr className={styles.divider} />
  </div>
)
export default Properties
