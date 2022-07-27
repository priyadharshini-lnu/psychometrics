import React, {
  useState, FC, useRef, useEffect,
} from 'react'
import { Button, Typography } from 'antd'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import cs from 'classnames'

import styles from './styles.less'

const { I18n } = window
const { Title } = Typography
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
  const [showExpandLink, setshowExpandLink] = useState(true)
  const [firstRender, setFirstRender] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.offsetHeight
      containerHeight < heightLimit && setshowExpandLink(false)
    }
    setFirstRender(false)
  }, [heightLimit])

  const handleClick = () => {
    setCollapsed(collapsed => !collapsed)
  }

  return (
    <div
      ref={containerRef}
      style={{ height: collapsed && showExpandLink && !firstRender ? heightLimit : '100%' }}
      className={cs({ [styles.container]: true, [styles['container--collapsed']]: collapsed })}
    >
      <Title level={5}>{title}</Title>
      {description}
      {showExpandLink && (
        <div className={styles['container-button']}>
          <Button type="link" onClick={handleClick}>
            {collapsed ? (
              <>
                <DownOutlined />
                {I18n.t('campaign.expand_link_text')}
              </>
            ) : (
              <>
                <UpOutlined />
                {I18n.t('campaign.collapse_link_text')}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
