import { FC, ReactNode } from 'react'
import { PageHeader } from '@ant-design/pro-components'
import { Button, Space } from 'antd'

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
    ghost={false}
    title={(
      <Space className={styles.subHeaderTitle}>
        {
          hideBackIcon ? null : (
            <Button
              size="small"
              type="text"
              aria-label={backButtonAriaLabel}
              onClick={onBack}
            >
              <DirectionalNavigateBackIcon className={styles.backIcon} />
            </Button>
          )
        }
        {title}
      </Space>
    )}
    extra={extra}
  />
)
