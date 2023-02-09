import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import PropertyFonts from '~/modules/reports/components/PropertyFonts'
import PropertyPagination from '~/modules/reports/components/PropertyPagination'

const Properties = ({ model }) => (
  <div>
    <div>Font</div>
    <PropertyFonts model={model} colors={false} />
    <hr className={styles.divider} />
    <PropertyPagination />
    <hr className={styles.divider} />
  </div>
)

export default Properties
