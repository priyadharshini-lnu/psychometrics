import React, {
  useState, FC, useRef, useEffect,
} from 'react'
import { Typography } from 'antd'
import cs from 'classnames'
import { DownOutlined, UpOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import { ScrollToViewOnFocusButton } from '~/glint'

import styles from './styles.less'

const { I18n } = window
const { Text } = Typography
const DEFAULT_HEIGHT_LIMIT = 500

type InstructionsPanelProps = {
  title: string
  heightLimit: number
  description: React.ReactElement
}

export const InstructionsPanel: FC<InstructionsPanelProps> = ({
  title, heightLimit = DEFAULT_HEIGHT_LIMIT, description,
}) => {
  const [collapsed, setCollapsed] = useState(true)
  const [showExpandLink, setShowExpandLink] = useState(true)
  const [firstRender, setFirstRender] = useState(true)
  const [animate, setAnimate] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.offsetHeight
      containerHeight < heightLimit && setShowExpandLink(false)
    }
    setFirstRender(false)
  }, [])

  useEffect(() => {
    const instuctionsElement = containerRef.current?.querySelector('iframe')
    if (instuctionsElement) {
      instuctionsElement.tabIndex = showExpandLink && collapsed ? -1 : 0
    }
  }, [showExpandLink, collapsed])

  const handleClick = () => {
    setAnimate(true)
    setCollapsed(collapsed => !collapsed)
  }

  return (
    <div
      ref={containerRef}
      style={{ height: collapsed && showExpandLink && !firstRender ? heightLimit : '100%' }}
      className={cs({
        [styles.container]: true,
        [styles['container--collapsed']]: collapsed,
        [styles.animate]: animate,
      })}
    >
      <div className={styles.instructionsContent}>
        <Text className="fs-16" strong>{title}</Text>
        <div aria-hidden={showExpandLink && collapsed ? 'true' : 'false'}>{description}</div>
        {showExpandLink && (
        <div className={styles['container-button']}>
          <ScrollToViewOnFocusButton
            scrollBehavior={{ behavior: 'smooth', block: 'end' }}
            icon={collapsed ? <DownOutlined /> : <UpOutlined />}
            type="primary"
            shape="round"
            onClick={handleClick}
            aria-label={collapsed
              ? I18n.t('campaign.instructions.collapse_aria_label') : I18n.t('campaign.instructions.expand_aria_label')}
          >
            {collapsed ? I18n.t('campaign.instructions.expand_link_text')
              : I18n.t('campaign.instructions.collapse_link_text')
            }
          </ScrollToViewOnFocusButton>
        </div>
        )}
      </div>

    </div>
  )
}
