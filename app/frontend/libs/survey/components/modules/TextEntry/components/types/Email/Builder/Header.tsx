import React from 'react'
import MultiInlineEditor from '../../../../../../MultiInlineEditor'
import styles from './EmailStyle.scss'
import commonStyles from '../EmailStyle.scss'

interface Props {
  title: string
  titleDescription: string
  changeProps: (value: string, key: string) => void
}
const Header: React.FC<Props> = ({
  title, titleDescription, changeProps,
}) => (
  <div className={commonStyles.header}>
    <div className={styles.title}>
      <MultiInlineEditor value={title} onChange={(e: string): void => changeProps(e, 'title')} />
    </div>
    <div className={styles.titleDescription}>
      <MultiInlineEditor value={titleDescription} onChange={(e: string): void => changeProps(e, 'titleDescription')} />
    </div>
  </div>
)

export default Header
