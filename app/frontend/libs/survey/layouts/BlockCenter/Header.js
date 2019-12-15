import React, { Component } from 'react'
import ActionsHistory from 'components/ActionsHistory'
import AppStore from 'store/AppStore'
import styles from './Header.scss'

const urldata = location.pathname.match(/blocks\/(\d+)/)
const id = urldata && urldata[1]
export class Header extends Component {
  save = () => {
    AppStore.saveBlock()
  }

  render () {
    return (
      <div className={`panel-heading ${styles.menu}`}>
        <div>
          <a href={`/administration/templates/blocks/${id}/preview`} className={`btn btn-default ${styles.preview}`}>
            <span className="fa fa-search" />
            Preview Block
          </a>
        </div>
        <ul className="panel-controls">
          <li>
            <button onClick={this.save} className={`btn btn-success ${styles.saveButton}`}>
              <i className="fa fa-save" />
              Save Block
            </button>
          </li>
          <li><ActionsHistory /></li>
        </ul>
      </div>
    )
  }
}

export default Header
