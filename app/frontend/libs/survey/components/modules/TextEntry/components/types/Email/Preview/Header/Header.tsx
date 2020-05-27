import React from 'react'
import Watchman from 'store/StoreWatchman'
import { EditOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import styles from './styles.scss'
import commonStyles from '../../commonStyles.scss'
import { Question } from '../../interfaces'
import { ViewEnum } from '../../constants'

interface Props {
  model: Question
  view: string
  setView: (view: ViewEnum) => void
}

const Header: React.FC<Props> = ({ model, view, setView }) => (
  <div className={commonStyles.header}>
    <div className="display-flex justify-content-space-between">
      <div className={styles.title}>{Watchman.I18n().tQuestion(model, 'title', {})}</div>
      {view === 'view' && (
      <Button
        type="primary"
        onClick={() => setView(ViewEnum.Edit)}
        icon={<EditOutlined />}
      >
        {Watchman.I18n().t('threesixty.question.email_type.edit')}
      </Button>
      )}
    </div>
    <div className={styles.titleDescription}>{Watchman.I18n().tQuestion(model, 'titleDescription', {})}</div>
  </div>
)

export default Header
