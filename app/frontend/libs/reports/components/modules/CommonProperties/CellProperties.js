import React from 'react'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'

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
