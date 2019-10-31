import React, { Component } from 'react'
import cs from 'classnames'
import AppStore from 'store/AppStore'
import store from 'store/FactorList'
import { RECODING, SCORING } from 'constants/scoring'
import FactorsMenu from './FactorsMenu'
import styles from './Scoring.scss'

export default class Header extends Component {
  closeScoring () {
    AppStore.scoring = false
    AppStore.update()
  }

  save () {
    AppStore.saveScoring()
  }

  render () {
    const { updateType, type } = this.props
    return (
      <div className={`panel-heading ${styles.menu}`}>
        <div className={styles.factorsContainer}>
          <div className="btn-group mrh">
            <button
              onClick={() => updateType(SCORING)}
              className={cs('btn', { active: type === SCORING })}
            >
              Scoring
            </button>
            <button
              onClick={() => updateType(RECODING)}
              className={cs('btn', { active: type === RECODING })}
            >
              Recoding
            </button>
          </div>
          {store.currentFactor && type === SCORING && <FactorsMenu />}
          <button onClick={this.save} className={`btn btn-success ${styles.saveButton}`}>
            <i className="fa fa-save" />
            Save
          </button>
        </div>
        <ul className="panel-controls">
          <li>
            <div>
              <a onClick={this.closeScoring} className={`btn btn-default ${styles.preview}`}>
                <span className="fa fa-chevron-left" />
                Back To Editor
              </a>
            </div>
          </li>
        </ul>
      </div>
    )
  }
}
