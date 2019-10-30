import React from 'react'
import PropertyFilter from 'rb/components/PropertyFilter'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'

const Properties = () => (
  <div>
    <div className={styles.title}>360 Report Summary</div>
    <PropertyFilter />
    <hr className={styles.divider} />
  </div>
)
export default Properties
