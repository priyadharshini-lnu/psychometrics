import React from 'react'
import FixedHeader from 'rb/views/FixedHeader'
import PropertyPanel from 'rb/views/PropertyPanel'
import styles from './PageEditor.scss'
import LeftSide from './LeftSide'
import RightSide from './RightSide'

const PageEditor = props => (
  <div className={styles.main}>
    <FixedHeader />
    <LeftSide {...props} />
    <RightSide />
    <PropertyPanel />
  </div>
)

export default PageEditor
