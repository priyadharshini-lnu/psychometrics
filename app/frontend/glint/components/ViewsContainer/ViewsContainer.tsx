import React, { FC, useEffect, useState } from 'react'
import {
  Row, Col, Button, Typography, Space,
} from 'antd'
import { UnorderedListOutlined, TableOutlined } from '@ant-design/icons'

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
}

export const ViewsContainer: FC<ViewsContainerProps> = ({
  onViewChange, title, children, defaultView = 'list',
}) => {
  const [view, setView] = useState<string>(defaultView)

  useEffect(() => {
    onViewChange && onViewChange(view)
  }, [view])

  return (
    <>
      <Row gutter={20}>
        <Col span={12}>
          <Title level={4} className={styles.title}>
            {title}
          </Title>
        </Col>
        <Col span={12} className={styles.viewControls}>
          <Space>
            <Button
              className={view === VIEW_TYPE.list ? styles.activeButton : styles.inActiveButton}
              id={VIEW_TYPE.list}
              shape="circle"
              onClick={() => setView(VIEW_TYPE.list)}
              icon={<UnorderedListOutlined />}
              size="middle"
            />
            <Button
              className={view === VIEW_TYPE.grid ? styles.activeButton : styles.inActiveButton}
              id={VIEW_TYPE.grid}
              onClick={() => setView(VIEW_TYPE.grid)}
              shape="circle"
              icon={<TableOutlined />}
              size="middle"
            />
          </Space>
        </Col>
      </Row>
      {children(view)}
    </>
  )
}
