import { FC, ReactNode } from 'react'
import { PageHeader } from '@ant-design/pro-layout'
import { Button } from 'antd'

import { DirectionalNavigateBackIcon } from '~/glint'
import styles from './SubHeader.less'

type Props = {
  title: string,
  onBack?: () => void,
  extra?: ReactNode,
  hideBackIcon?: boolean,
  backButtonAriaLabel?: string,
}

export const SubHeader:FC<Props> = ({
  title, onBack, extra, hideBackIcon, backButtonAriaLabel,
}) => (
  <PageHeader
    className={styles.subHeader}
    backIcon={hideBackIcon ? false : (
      <Button
        ghost
        size="small"
        type="text"
        aria-label={backButtonAriaLabel}
      >
        <DirectionalNavigateBackIcon className={styles.backIcon} />
      </Button>
    )}
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
