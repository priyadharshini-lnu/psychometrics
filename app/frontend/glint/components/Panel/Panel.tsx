import React from 'react'
import { Collapse, Divider } from 'antd'
import cs from 'classnames'
import { DownOutlined, CloseOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
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
  additionalDetailsLabelStyle?: React.CSSProperties
  footer?: JSX.Element | null
  removable?: boolean
  onRemove?: () => void
  defaultOpen?: boolean
  className?: string
}

export const Panel: React.FC<Props> = ({
  children,
  title,
  description,
  collapsible = false,
  additionalDetails,
  additionalDetailsLayout = 'vertical',
  additionalDetailsLabelStyle,
  footer,
  removable,
  onRemove,
  defaultOpen = true,
  className,
}) => {
  const { width: windowWidth } = useWindowSize()
  const showSidebarForAdditionalDetails = windowWidth > 768 && additionalDetailsLayout === 'vertical'

  return (
    <div className={cs(styles.collapseContainer, className)}>
      <Collapse
        accordion
        defaultActiveKey={defaultOpen ? ['1'] : ''}
        onChange={() => {}}
        expandIconPlacement="end"
        expandIcon={() => (collapsible ? <DownOutlined /> : null)}
        bordered={false}
        items={[{
          key: '1',
          label: (
            <PanelTitle
              title={title}
              description={description}
              additionalDetails={showSidebarForAdditionalDetails ? undefined : additionalDetails}
            />
          ),
          extra: (
            <>
              {additionalDetails && showSidebarForAdditionalDetails
              && (
                <AdditionalDetails
                  className={cs({ 'me-6': removable })}
                  additionalDetails={additionalDetails}
                  layout="vertical"
                  labelStyles={additionalDetailsLabelStyle}
                />
              )}
              {removable ? (
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove && onRemove()
                  }}
                  className={styles.removeIcon}
                >
                  <CloseOutlined />
                </div>
              ) : null}
            </>
          ),
          className: cs({ [styles.nonCollapsiblePanel]: !collapsible }),
          children: (
            <>
              <Divider plain className={styles.divider} />
              {children}
              {footer && (
                <>
                  <Divider plain className={styles.divider} />
                  {footer}
                </>
              )}
            </>
          ),
        }]}
      />
    </div>
  )
}
