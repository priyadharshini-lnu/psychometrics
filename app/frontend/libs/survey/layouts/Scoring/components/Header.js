import React, { Component } from 'react'
import cs from 'classnames'
import { RECODING, SCORING } from 'constants/scoring'
import NotificationDispatcher from 'dispatchers/NotificationDispatcher'
import FactorsMenu from './FactorsMenu'
import styles from './Scoring.scss'

export default class Header extends Component {
  closeScoring = () => {
    const { history, match: { params: { id } } } = this.props
    history.push(`/administration/assessments/${id}`)
  }

  save = () => {
    const {
      saveScoring, assessmentId, factors, recoding,
    } = this.props
    saveScoring(assessmentId, factors, recoding).then(() => {
      NotificationDispatcher.notify({ message: 'Scoring successfully saved' })
    }).catch(() => {
      NotificationDispatcher.notify({ level: 'error', message: 'Something went wrong. Contact your administrator.' })
    })
  }

  render () {
    const { selectedFactor, updateType, type } = this.props
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
          {selectedFactor && type === SCORING && <FactorsMenu {...this.props} />}
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
