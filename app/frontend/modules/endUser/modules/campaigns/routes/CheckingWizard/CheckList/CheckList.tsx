import React from 'react'
import { List } from 'antd'
import { CheckCircleFilled, LoadingOutlined, CloseCircleFilled } from '@ant-design/icons'
import cs from 'classnames'
import styles from './CheckList.less'
import { CheckListItem } from '../interfaces'

interface Props {
  dataSource: CheckListItem[]
  className?: string
}

export const CheckList: React.FC<Props> = ({ dataSource, className }) => (
  <List
    className={cs(styles.container, className)}
    header={false}
    footer={false}
    bordered
    dataSource={dataSource}
    renderItem={(item) => {
      const Icon = ICONS[item.status]
      return (
        <List.Item className={styles.item}>
          <span>{item.name}</span>
          {Icon && <Icon />}
        </List.Item>
      )
    }}
  />
)

const FailedIcon: React.FC<{}> = () => <CloseCircleFilled className={styles.failedIcon} />
const InProgressIcon: React.FC<{}> = () => <LoadingOutlined spin />
const DoneIcon: React.FC<{}> = () => <CheckCircleFilled className={styles.successIcon} />

const ICONS = {
  failed: FailedIcon,
  in_progress: InProgressIcon,
  done: DoneIcon,
}
