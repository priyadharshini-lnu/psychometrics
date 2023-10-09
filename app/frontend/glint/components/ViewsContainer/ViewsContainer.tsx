import React, {
  FC, useEffect, useContext,
} from 'react'
import {
  Row, Col, Button, Typography, Space,
} from 'antd'
import { UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons'

import { useLocalStorage } from '~/hooks/useLocalStorage'
import { MediaQueryContext } from '~/glint'

import styles from './styles.less'

const { Title } = Typography

const VIEW_TYPE = {
  list: 'list',
  grid: 'grid',
}

type ViewsContainerProps = {
  title: string
  onViewChange?: (activeView: string) => void
  children: (view: string) => React.ReactElement | React.ReactNode
  defaultView?: 'list' | 'grid'
  viewTypeStorageKey?: string
  className?: string
}

export const ViewsContainer: FC<ViewsContainerProps> = ({
  onViewChange, title, children, defaultView = 'list', viewTypeStorageKey = 'listType', className,
}) => {
  const [view, setView] = useLocalStorage<string>(viewTypeStorageKey, defaultView)
  const { isMobile } = useContext(MediaQueryContext) || { isMobile: null }

  useEffect(() => {
    onViewChange && onViewChange(view)
  }, [view])

  return (
    <>
      <div className={className}>
        <Row gutter={20}>
          <Col span={12}>
            <Title level={4} className={styles.title}>
              {title}
            </Title>
          </Col>
          { !isMobile && (
          <Col span={12} className={styles.viewControls}>
            <Space>
              <Button
                className={view === VIEW_TYPE.grid ? styles.activeButton : styles.inActiveButton}
                id={VIEW_TYPE.grid}
                onClick={() => setView(VIEW_TYPE.grid)}
                shape="circle"
                icon={<AppstoreOutlined />}
                size="middle"
              />
              <Button
                className={view === VIEW_TYPE.list ? styles.activeButton : styles.inActiveButton}
                id={VIEW_TYPE.list}
                shape="circle"
                onClick={() => setView(VIEW_TYPE.list)}
                icon={<UnorderedListOutlined />}
                size="middle"
              />
            </Space>
          </Col>
          )}
        </Row>
      </div>
      {children(view)}
    </>
  )
}
