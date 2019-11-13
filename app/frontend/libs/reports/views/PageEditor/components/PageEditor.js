import React from 'react'
import FixedHeader from 'rb/views/FixedHeader'
import PropertyPanel from 'rb/views/PropertyPanel'
import styles from './PageEditor.scss'
import LeftSide from './LeftSide'
import RightSide from './RightSide'

const PageEditor = () => (
  <div className={styles.main}>
    <FixedHeader />
    <LeftSide />
    <RightSide />
    <PropertyPanel />
  </div>
)

export default PageEditor
