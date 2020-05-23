import React from 'react'
import Watchman from 'store/StoreWatchman'
import styles from './styles.scss'
import { Question } from '../../interfaces'
import { ViewEnum } from '../../constants'

interface Props {
  model: Question
  readOnly?: boolean
  setView: (view: ViewEnum) => void
}

const ReadOnly: React.FC<Props> = ({ model }) => {
  const {
    answers: {
      message, cc, bcc, to,
    },
  } = model.result

  return (
    <div className={styles.container}>
      <table>
        <tbody>
          <tr>
            <td className={styles.contactLabel}>{Watchman.I18n().t('threesixty.question.email_type.to')}</td>
            <td>{to && to.join(', ')}</td>
          </tr>
          {cc && cc.length ? (
            <tr>
              <td className={styles.contactLabel}>{Watchman.I18n().t('threesixty.question.email_type.cc')}</td>
              <td>{cc.join(', ')}</td>
            </tr>
          ) : null}
          {bcc && bcc.length ? (
            <tr>
              <td className={styles.contactLabel}>{Watchman.I18n().t('threesixty.question.email_type.bcc')}</td>
              <td>{bcc.join(', ')}</td>
            </tr>
          ) : null}
        </tbody>
      </table>
      <hr />
      <div className={styles.body}>
        {message}
      </div>

    </div>
  )
}

export default ReadOnly
