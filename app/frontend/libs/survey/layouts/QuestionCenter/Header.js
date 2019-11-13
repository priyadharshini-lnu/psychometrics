import React, { Component } from 'react'
import ActionsHistory from 'components/ActionsHistory'
import AppStore from 'store/AppStore'
import styles from './Header.scss'

export class Header extends Component {
  save = () => {
    AppStore.saveQuestion()
  }

  render () {
    return (
      <div className={`panel-heading ${styles.menu}`}>
        <div />
        <ul className="panel-controls">
          <li>
            <button onClick={this.save} className={`btn btn-success ${styles.saveButton}`}>
              <i className="fa fa-save" />
              Save Question
            </button>
          </li>
          <li><ActionsHistory /></li>
        </ul>
      </div>
    )
  }
}

export default Header
