import React from 'react'
import styles from './Flow.scss'

const ButtonNew = ({ onClick }) => (
  <div className={`btn btn-default ${styles.newLine}`} onClick={onClick}>
    <span className="fa fa-plus" />
    Add a new Element Here
  </div>
)

export default ButtonNew
