import React, { useState, useEffect } from 'react'
import { Button } from 'antd'
import _ from 'lodash'
import { SendOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { I18n } from '~/modules/survey/store/StoreWatchman'
import { QuestionError } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import { Question } from '../interfaces'
import styles from './styles.less'
import commonStyles from '../commonStyles.less'
import Header from './Header'
import Form from './Form'
import SendAnimation from './SendAnimation'
import ReadOnly from './ReadOnly'
import { ViewEnum } from '../constants'

interface Props {
  model: Question
  readOnly?: boolean
  addQuestionError(questionId: number, errors: QuestionError[]): void
  removeQuestionError(questionId: number): void
  errors: QuestionError[]
}

const VIEWS = {
  edit: Form,
  view: ReadOnly,
  sent: SendAnimation,
}

const Preview: React.FC<Props> = ({
  model, readOnly, addQuestionError, removeQuestionError, errors,
}) => {
  const [view, setView] = useState(ViewEnum.Edit)

  useEffect(() => {
    const { answers: { message } } = model.result
    if (message) { setView(ViewEnum.View) }
  }, [])

  const View = VIEWS[view]

  const handleSendClick = () => {
    const emailValidationErrors = model.result.validate()
    if (!_.isEmpty(emailValidationErrors)) {
      addQuestionError(model.id, emailValidationErrors)
    } else {
      removeQuestionError(model.id)
      setView(ViewEnum.Sent)
    }
  }

  return (
    <div className={commonStyles.container}>
      {view !== ViewEnum.Sent && <Header model={model} view={view} setView={setView} readOnly={readOnly} />}
      <View model={model} errors={errors} readOnly={readOnly} setView={setView} />
      {!readOnly && view === ViewEnum.Edit && (
        <div className={styles.buttonContainer}>
          <Button
            type="primary"
            onClick={handleSendClick}
            icon={<SendOutlined className="rtl-flip" />}
          >
            {I18n().t('threesixty.question.email_type.send')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default Preview
