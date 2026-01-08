import React from 'react'
import { Divider } from 'antd'
import { UserOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import MultiInlineEditor from '../../../../../../MultiInlineEditor'
import styles from './ChatStyle.less'
import commonStyles from '../ChatStyle.less'

interface Props {
  title: string
  titleDescription: string
  managerName: string
  changeProps: (value: string, key: string) => void
}
const Header: React.FC<Props> = ({
  title, titleDescription, managerName, changeProps,
}) => (
  <div className={commonStyles.header}>
    <div className={styles.title}>
      <MultiInlineEditor value={title} onChange={(e: string): void => changeProps(e, 'title')} />
    </div>
    <div className={styles.titleDescription}>
      <MultiInlineEditor value={titleDescription} onChange={(e: string): void => changeProps(e, 'titleDescription')} />
    </div>
    <div className={commonStyles.manager}>
      <div className={commonStyles.managerIconContainer}>
        <UserOutlined className={commonStyles.managerIcon} />
      </div>
      <div>
        <div className={commonStyles.managerName}>
          <MultiInlineEditor value={managerName} onChange={(e: string): void => changeProps(e, 'managerName')} />
        </div>
      </div>
    </div>
    <Divider />
  </div>
)

export default Header
