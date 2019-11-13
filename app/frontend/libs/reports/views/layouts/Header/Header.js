import React from 'react'
import AppStore from 'rb/store/AppStore'
import styles from './Header.scss'

const Header = () => (
  <div className={`panel-heading ${styles.menu}`}>
    <div>
      <h3 className="panel-title">
        Assessment
        {AppStore.name}
      </h3>
    </div>
  </div>
)

export default Header
