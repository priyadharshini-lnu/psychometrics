import React from 'react'
import { EditOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { I18n } from '~/modules/survey/store/StoreWatchman'
import styles from './styles.less'
import commonStyles from '../../commonStyles.less'
import { Question } from '../../interfaces'
import { ViewEnum } from '../../constants'

interface Props {
  model: Question
  view: string
  readOnly?: boolean
  setView: (view: ViewEnum) => void
}

const Header: React.FC<Props> = ({
  model, view, setView, readOnly,
}) => (
  <div className={commonStyles.header}>
    <div className="display-flex justify-content-space-between">
      <div className={styles.title}>{I18n().tQuestion(model, 'title', {})}</div>
      {!readOnly && view === 'view' && (
        <Button
          type="primary"
          onClick={() => setView(ViewEnum.Edit)}
          icon={<EditOutlined />}
        >
          {I18n().t('threesixty.question.email_type.edit')}
        </Button>
      )}
    </div>
    <div className={styles.titleDescription}>{I18n().tQuestion(model, 'titleDescription', {})}</div>
  </div>
)

export default Header
