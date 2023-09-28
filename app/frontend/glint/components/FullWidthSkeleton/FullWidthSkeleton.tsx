import { FC } from 'react'
import _ from 'lodash'
import { Skeleton, Space } from 'antd'
import { SkeletonInputProps } from 'antd/lib/skeleton/Input'
import styles from './FullWidthSkeleton.less'

const DEFAULT_ROWS = 1
const DEFAULT_HEIGHT = '15vh'
type Props = {
  rows: number
  height?: string
} & SkeletonInputProps

export const FullWidthSkeleton:FC<Props> = ({ rows, height, ...props }) => (
  <Space className="w-100" direction="vertical">
    {
      _.range(0, rows || DEFAULT_ROWS).map(number => (
        <Skeleton.Input
          style={{ height: height || DEFAULT_HEIGHT }}
          key={number}
          className={styles.skeleton}
          {...props}
        />
      ))
    }
  </Space>
)
