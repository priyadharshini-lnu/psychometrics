import React, { FC } from 'react'
import { Collapse, Space } from 'antd'
import styles from './CollapseItem.less'

const { Panel } = Collapse

type Props = {
  title: string,
  list: object[],
  children: (item) => React.ReactElement | React.ReactNode
}

export const CollapseItem: FC<Props> = ({ title, list, children }) => (
  <Collapse className={styles.collapse} bordered={false} defaultActiveKey="panel">
    <Panel header={title} key="panel">
      <Space direction="vertical" size="middle">
        {list.map(item => children(item))}
      </Space>
    </Panel>
  </Collapse>
)
