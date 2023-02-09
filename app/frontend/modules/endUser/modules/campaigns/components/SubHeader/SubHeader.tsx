import { FC, ReactNode } from 'react'
import { PageHeader } from 'antd'

import { DirectionalNavigateBackIcon } from '~/glint'
import styles from './SubHeader.less'

type Props = {
  title: string,
  onBack?: () => void,
  extra?: ReactNode,
  hideBackIcon?: boolean,
}

export const SubHeader:FC<Props> = ({
  title, onBack, extra, hideBackIcon,
}) => (
  <PageHeader
    className={styles.subHeader}
    backIcon={hideBackIcon ? false : <DirectionalNavigateBackIcon className={styles.backIcon} />}
    ghost={false}
    title={(
      <div className={styles.subHeaderTitle}>
        {title}
      </div>
          )}
    onBack={onBack}
    extra={extra}
  />
)
