import React from 'react'
import ActionsHistory from 'components/ActionsHistory'
import NotificationDispatcher from 'libs/survey/dispatchers/NotificationDispatcher'
import { save } from 'libs/survey/core/builder/questionCenter'
import { connect } from 'react-redux'
import styles from './Header.scss'


const Header = ({ save, question }) => {
  const saveHandler = () => {
    save(question).then(() => {
      NotificationDispatcher.notify({ message: 'Question successfully saved' })
    }).catch(() => {
      NotificationDispatcher.notify({ level: 'error', message: 'Something went wrong. Contact your administrator.' })
    })
  }

  return (
    <div className={`panel-heading ${styles.menu}`}>
      <div />
      <ul className="panel-controls">
        <li>
          <button onClick={saveHandler} className={`btn btn-success ${styles.saveButton}`}>
            <i className="fa fa-save" />
            Save Question
          </button>
        </li>
        <li><ActionsHistory /></li>
      </ul>
    </div>
  )
}

export default connect(
  ({ survey }) => ({
    question: survey.builder.questionCenter.question,
  }),
  {
    save,
  },
)(Header)
