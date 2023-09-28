import { useRef, useState } from 'react'
import _ from 'lodash'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { connect } from 'react-redux'
import NotificationDispatcher from '~/modules/survey/dispatchers/NotificationDispatcher'
import QuestionSerializer from '~/modules/survey/models/QuestionSerializer'
import { importTranslations, save } from '~/modules/survey/core/builder/questionCenter'
import ActionsHistory from '~/modules/survey/components/ActionsHistory'
import styles from './Header.less'
import { ImportModal } from './ImportTranslations'

const Header = ({ save, question, importTranslations }) => {
  const form = useRef()
  const data = useRef()
  const [showModal, setShowModal] = useState(false)
  const saveHandler = () => {
    save(question).then(() => {
      NotificationDispatcher.notify({ message: 'Question successfully saved' })
    }).catch(() => {
      NotificationDispatcher.notify({ level: 'error', message: 'Something went wrong. Contact your administrator.' })
    })
  }

  const onExport = () => {
    const result = {
      question: QuestionSerializer.wrap(question).exportLocales(),
    }

    data.current.value = JSON.stringify(result)
    form.current.submit()
  }

  const onImport = (file) => {
    if (!file) {
      return setShowModal(false)
    }
    const form = new FormData()
    form.append('question_id', question.id)
    form.append('file', file)
    importTranslations(question.id, form).then(() => {
      setShowModal(false)
    })
  }

  return (
    <div className={`panel-heading ${styles.menu}`}>
      <ul className="panel-controls">
        <li>
          <DropdownButton
            onClick={e => e.stopPropagation(e)}
            className={styles.dropdown}
            bsStyle="default"
            title={(
              <span>
                <span className="icon fa fa-gear" />
                Options
              </span>
              )}
            id="main_menu"
          >
            <MenuItem onSelect={onExport}>Export Translations</MenuItem>
            <li>
              <a
                className={styles.linkExport}
                data-remote="true"
                onClick={() => setShowModal(true)}
                href="#"
              >
                Import Translations
              </a>
            </li>
          </DropdownButton>
          <form
            style={{ display: 'none' }}
            ref={form}
            action={`/administration/translations/questions/${_.result(question, 'id')}/export`}
            method="POST"
          >
            <input
              name="authenticity_token"
              type="hidden"
              value={document.querySelector('meta[name="csrf-token"]').getAttribute('content')}
            />
            <input ref={data} name="data" />
          </form>
        </li>
        <li>
          <button onClick={saveHandler} className={`btn btn-success ${styles.saveButton}`}>
            <i className="fa fa-save" />
            Save Question
          </button>
        </li>
        <li><ActionsHistory /></li>
      </ul>
      <ImportModal show={showModal} onImport={onImport} onClose={() => setShowModal(false)} />
    </div>
  )
}

export default connect(
  ({ survey }) => ({
    question: survey.builder.questionCenter.question,
  }),
  {
    save,
    importTranslations,
  },
)(Header)
