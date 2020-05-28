import React from 'react'
import cs from 'classnames'
import NotificationDispatcher from 'dispatchers/NotificationDispatcher'
import styles from './ResourceManager.scss'

export default function Header ({
  history, saveResources, assessmentId, resources, addResource,
}) {
  const closeScoring = () => {
    const { match: { params: { id } } } = history
    history.push(`/administration/assessments/${id}`)
  }

  const save = () => {
    saveResources(assessmentId, resources).then(() => {
      NotificationDispatcher.notify({ message: 'Scoring successfully saved' })
    }).catch(() => {
      NotificationDispatcher.notify({ level: 'error', message: 'Something went wrong. Contact your administrator.' })
    })
  }

  return (
    <div className={`panel-heading ${styles.menu}`}>
      <div className={styles.factorsContainer}>
        <div className="btn-group mrh">
          <button
            onClick={() => addResource()}
            className={cs('btn')}
          >
            Add Resource
          </button>
        </div>
        <button onClick={save} className={`btn btn-success ${styles.saveButton}`}>
          <i className="fa fa-save" />
          Save
        </button>
      </div>
      <ul className="panel-controls">
        <li>
          <div>
            <a onClick={closeScoring} className={`btn btn-default ${styles.preview}`}>
              <span className="fa fa-chevron-left" />
              Back To Editor
            </a>
          </div>
        </li>
      </ul>
    </div>
  )
}
