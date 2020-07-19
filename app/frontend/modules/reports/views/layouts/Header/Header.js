import React from 'react'
import styles from './Header.scss'

const Header = ({ name }) => (
  <div className={`panel-heading ${styles.menu}`}>
    <div>
      <h3 className="panel-title">
        Assessment
        {name}
      </h3>
    </div>
  </div>
)

export default Header
