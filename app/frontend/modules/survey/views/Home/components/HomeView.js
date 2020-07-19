import React from 'react'
import BlockList from 'views/BlockList'
import styles from './HomeView.scss'

const HomeView = () => (
  <div className={styles.survey}>
    <BlockList />
  </div>
)

export default HomeView
