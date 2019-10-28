import React, { Component } from 'react'
import store from 'store/AssessmentPreviewStore'
import styles from './Header.scss'

export class Header extends Component {
  changeHidden = (e) => {
    store.hideHiddenQuestions = e.currentTarget.checked
    store.update()
    this.forceUpdate()
  }

  changeIgnore = (e) => {
    store.ignoreValidation = e.currentTarget.checked
    store.update()
    this.forceUpdate()
  }

  restart = () => {
    store.restart()
  }

  render () {
    const { langs } = this.props
    return (
      <div className={`panel-heading ${styles.menu}`}>
        <div className={styles.preview}>
          <span className={`fa fa-search ${styles.icon}`} />
          Previewing Assessment
        </div>
        <div className={styles.options}>
          <label>
            <input type="checkbox" onChange={this.changeIgnore} checked={store.ignoreValidation} />
            Ignore Validation
          </label>
          <label>
            <input type="checkbox" onChange={this.changeHidden} checked={store.hideHiddenQuestions} />
            Do Not Show Hidden Questions
          </label>
        </div>
        <div className={styles.restart}>
          <button className="btn btn-success" onClick={this.restart}>Click Here to Start Over</button>
        </div>
        <div dangerouslySetInnerHTML={{ __html: langs }} />
      </div>
    )
  }
}

export default Header
