import React from 'react'
import { Collapse, Divider } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import cs from 'classnames'
import { PanelTitle } from './PanelTitle'
import { useWindowSize } from '~/hooks/useWindowSize'
import { AdditionalDetails } from './AdditionalDetails'
import { AdditionsDetailsData } from './interfaces'
import styles from './Panel.less'

interface Props {
  title: string
  description?: string
  collapsible?: boolean
  children: React.ReactNode
  additionalDetails?: AdditionsDetailsData
  additionalDetailsLayout?: 'horizontal' | 'vertical'
}

export const Panel: React.FC<Props> = ({
  children,
  title,
  description,
  collapsible = false,
  additionalDetails,
  additionalDetailsLayout = 'vertical',
}) => {
  const { width: windowWidth } = useWindowSize()
  const showSidebarForAdditionalDetails = windowWidth > 768 && additionalDetailsLayout === 'vertical'

  return (
    <div className={styles.collapseContainer}>
      <Collapse
        defaultActiveKey={['1']}
        onChange={() => {}}
        expandIconPosition="end"
        expandIcon={() => (collapsible ? <DownOutlined /> : null)}
        bordered={false}
      >
        <Collapse.Panel
          header={(
            <PanelTitle
              title={title}
              description={description}
              additionalDetails={showSidebarForAdditionalDetails ? undefined : additionalDetails}
            />
          )}
          key="1"
          extra={
            additionalDetails && showSidebarForAdditionalDetails
              && <AdditionalDetails additionalDetails={additionalDetails} layout="vertical" />
          }
          className={cs({ [styles.nonCollapsiblePanel]: !collapsible })}
        >
          <Divider plain className={styles.divider} />
          {children}
        </Collapse.Panel>
      </Collapse>
    </div>
  )
}
