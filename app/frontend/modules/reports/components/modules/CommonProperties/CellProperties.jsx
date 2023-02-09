import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'

const PageProperties = () => (
  <div>
    <div className={styles.title}>Cell Options</div>
    <hr className={styles.divider} />
    <div>Color</div>
    <div>Font</div>
    <div>Alignment</div>
    <div>Borders</div>
  </div>
)

export default PageProperties
