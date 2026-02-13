import React, { FC } from 'react'
import { Collapse, Space } from 'antd'
import styles from './CollapseItem.less'

type Props = {
  title: string,
  list: object[],
  children: (item) => React.ReactElement | React.ReactNode
}

export const CollapseItem: FC<Props> = ({ title, list, children }) => (
  <Collapse
    className={styles.collapse}
    bordered={false}
    defaultActiveKey="panel"
    items={[{
      key: 'panel',
      label: title,
      children: (
        <Space size={0} orientation="vertical">
          {list.map(item => children(item))}
        </Space>
      ),
    }]}
  />
)
