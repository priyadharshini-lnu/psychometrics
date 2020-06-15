import React from 'react'
import { Divider } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { I18n } from 'store/StoreWatchman'
import styles from './ChatStyle.scss'
import commonStyles from '../ChatStyle.scss'
import { Question } from '../interfaces'

interface Props {
  model: Question
}

const Header: React.FC<Props> = ({ model }) => (
  <div className={commonStyles.header}>
    <div className={styles.title}>{I18n().tQuestion(model, 'title', {})}</div>
    <div className={styles.titleDescription}>{I18n().tQuestion(model, 'titleDescription', {})}</div>
    <div className={commonStyles.manager}>
      <div className={commonStyles.managerIconContainer}>
        <UserOutlined className={commonStyles.managerIcon} />
      </div>
      <div>
        <div className={commonStyles.managerName}>{I18n().tQuestion(model, 'managerName', {})}</div>
      </div>
    </div>
    <Divider />
  </div>
)

export default Header
