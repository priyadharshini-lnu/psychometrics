import React, { useState, useEffect } from 'react'
import Watchman from 'store/StoreWatchman'
import { SendOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Question } from '../interfaces'
import styles from './styles.scss'
import commonStyles from '../commonStyles.scss'
import Header from './Header'
import Form from './Form'
import SendAnimation from './SendAnimation'
import ReadOnly from './ReadOnly'
import { ViewEnum } from '../constants'

interface Props {
  model: Question
  readOnly?: boolean
}
const VIEWS = {
  edit: Form,
  view: ReadOnly,
  sent: SendAnimation,
}

const Preview: React.FC<Props> = ({ model, readOnly }) => {
  const [view, setView] = useState(ViewEnum.Edit)

  useEffect(() => {
    const { answers: { message } } = model.result
    if (message) { setView(ViewEnum.View) }
  }, [])

  const View = VIEWS[view]
  return (
    <div className={commonStyles.container}>
      {view !== ViewEnum.Sent && <Header model={model} view={view} setView={setView} />}
      <View model={model} readOnly={readOnly} setView={setView} />
      {view === ViewEnum.Edit && (
        <div className={styles.buttonContainer}>
          <Button
            type="primary"
            onClick={() => setView(ViewEnum.Sent)}
            icon={<SendOutlined />}
          >
            {Watchman.I18n().t('threesixty.question.email_type.send')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default Preview
