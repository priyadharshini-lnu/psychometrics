import { FC } from 'react'
import { Flex, Skeleton } from 'antd'

const { I18n } = window

const ROWS = [0, 1, 2, 3, 4]

/** The shape a page arrives in — title bar, toolbar, rows — so the wait reads as progress rather than a stall. */
export const PageSkeleton: FC = () => (
  <Flex vertical gap="large" role="status" aria-busy aria-label={I18n.t('administration.common.loading')}>
    <Flex align="center" justify="space-between" gap="middle" wrap>
      <Skeleton.Input active size="large" />
      <Skeleton.Button active size="large" />
    </Flex>
    <Flex align="center" gap="small" wrap>
      <Skeleton.Button active size="small" />
      <Skeleton.Button active size="small" />
      <Skeleton.Input active size="small" />
    </Flex>
    <Flex vertical gap="middle">
      {ROWS.map(row => <Skeleton.Input key={row} active block />)}
    </Flex>
  </Flex>
)
