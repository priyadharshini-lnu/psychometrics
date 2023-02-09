import { FC } from 'react'
import { Space, Skeleton } from 'antd'
import { AppstoreOutlined } from '@ant-design/icons'

const { I18n } = window

interface Props {
  selectedCount?: number
  totalCount: number | undefined
  isLoading?: boolean
}

export const CountDisplay: FC<Props> = ({
  selectedCount = 0,
  totalCount = 0,
  isLoading = false,
}) => (
  <Space>
    <AppstoreOutlined />
    {isLoading ? (
      <Skeleton.Button active size="small" shape="square" />
    ) : (
      <span>
        {selectedCount === 0
          ? I18n.t('administration.table.entries.total', { count: totalCount })
          : I18n.t('administration.table.entries.selected', {
            count: selectedCount,
          })}
      </span>
    )}
  </Space>
)
