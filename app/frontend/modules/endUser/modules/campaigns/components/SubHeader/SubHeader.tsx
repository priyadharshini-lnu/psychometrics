import React, { FC, ReactNode } from 'react'
import { PageHeader } from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'

import { isRtl } from 'utils/locales'
import styles from './SubHeader.less'

const { I18n } = window
const uiLocale = I18n && I18n.uiLocale
const rtl = uiLocale && isRtl(uiLocale)
type Props = {
  title: string,
  onBack: () => void,
  extra?: ReactNode,
}

export const SubHeader:FC<Props> = ({ title, onBack, extra }) => (
  <PageHeader
    className={styles.subHeader}
    backIcon={rtl ? <ArrowRightOutlined className={styles.backIcon} />
      : <ArrowLeftOutlined className={styles.backIcon} />}
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
