import React from 'react'
import { Collapse, Divider } from 'antd'
import { DownOutlined, CloseOutlined } from '@ant-design/icons'
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
  footer?: JSX.Element | null
  removable?: boolean
  onRemove?: () => void
  defaultOpen?: boolean
}

export const Panel: React.FC<Props> = ({
  children,
  title,
  description,
  collapsible = false,
  additionalDetails,
  additionalDetailsLayout = 'vertical',
  footer,
  removable,
  onRemove,
  defaultOpen = true,
}) => {
  const { width: windowWidth } = useWindowSize()
  const showSidebarForAdditionalDetails = windowWidth > 768 && additionalDetailsLayout === 'vertical'

  return (
    <div className={styles.collapseContainer}>
      <Collapse
        accordion
        defaultActiveKey={defaultOpen ? ['1'] : ''}
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
          extra={(
            <>
              {additionalDetails && showSidebarForAdditionalDetails
              && (
              <AdditionalDetails
                className={cs({ 'me-6': removable })}
                additionalDetails={additionalDetails}
                layout="vertical"
              />
              )}
              {removable ? (
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove
                  }}
                  className={styles.removeIcon}
                >
                  <CloseOutlined />
                </div>
              ) : null}
            </>
          )}
          className={cs({ [styles.nonCollapsiblePanel]: !collapsible })}
        >
          <Divider plain className={styles.divider} />
          {children}
          {footer && (
            <>
              <Divider plain className={styles.divider} />
              {footer}
            </>
          )}
        </Collapse.Panel>
      </Collapse>
    </div>
  )
}
