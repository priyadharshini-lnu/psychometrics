import React from 'react'
import BlockList from 'views/BlockList'
import Instructions from 'views/Instructions'
import styles from './HomeView.scss'

const HomeView = () => (
  <div className={styles.survey}>
    <Instructions />
    <BlockList />
  </div>
)

export default HomeView
