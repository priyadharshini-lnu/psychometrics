import React from 'react'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import PropertyFonts from 'rb/components/PropertyFonts'
import PropertyPagination from 'rb/components/PropertyPagination'

const Properties = () => (
  <div>
    <div>Font</div>
    <PropertyFonts colors={false} />
    <hr className={styles.divider} />
    <PropertyPagination />
    <hr className={styles.divider} />
  </div>
)

export default Properties
