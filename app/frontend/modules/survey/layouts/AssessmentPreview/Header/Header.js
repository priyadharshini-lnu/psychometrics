import React from 'react'
import styles from './Header.scss'

const Header = ({
  langs, hideHiddenQuestions, ignoreValidation, toggleHiddenQuestions,
  toggleIgnoreValidation, reset,
}) => (
  <div className={`panel-heading ${styles.menu}`}>
    <div className={styles.preview}>
      <span className={`fa fa-search ${styles.icon}`} />
      Previewing Assessment
    </div>
    <div className={styles.options}>
      <label>
        <input type="checkbox" onChange={toggleIgnoreValidation} checked={ignoreValidation} />
        Ignore Validation
      </label>
      <label>
        <input type="checkbox" onChange={toggleHiddenQuestions} checked={hideHiddenQuestions} />
        Do Not Show Hidden Questions
      </label>
    </div>
    <div className={styles.restart}>
      <button className="btn btn-success" onClick={reset}>Click Here to Start Over</button>
    </div>
    {/* eslint-disable-next-line react/no-danger */}
    <div dangerouslySetInnerHTML={{ __html: langs }} />
  </div>
)

export default Header
