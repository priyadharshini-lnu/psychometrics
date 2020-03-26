import React from 'react'
import Watchman from 'store/StoreWatchman'
import styles from './EmailStyle.scss'
import commonStyles from '../EmailStyle.scss'
import { Question } from '../interfaces'

interface Props {
  model: Question
}

const Header: React.FC<Props> = ({ model }) => (
  <div className={commonStyles.header}>
    <div className={styles.title}>{Watchman.I18n().tQuestion(model, 'title', {})}</div>
    <div className={styles.titleDescription}>{Watchman.I18n().tQuestion(model, 'titleDescription', {})}</div>
  </div>
)

export default Header
