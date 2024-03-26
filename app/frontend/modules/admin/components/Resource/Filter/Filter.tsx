import { FC, ReactNode } from 'react'
import {
  Input, Space, Row, Col,
} from 'antd'
import { CountDisplay } from '~/components/CountDisplay'
import { useResourceContext } from '../ResourceContext'
import { TagFilter } from '~/modules/admin/components/Resource/TagFilter'

const { I18n } = window

const { Search } = Input

type Props = {
  children?: ReactNode
  placeholder?: string
  name: string
  hideSearch?: boolean
  showTagFilter?: boolean
}

export const Filter: FC<Props> = ({
  children,
  placeholder,
  name,
  hideSearch,
  showTagFilter,
}) => {
  const { resource } = useResourceContext()
  const loading = resource.isLoading('fetch')

  const requestFailed = resource.requests.fetch?.status === 'failed'

  const defaultPlaceholder = I18n.t('common.actions.search')

  return (
    <Row
      justify="space-between"
      align="middle"
      className="pt-4 pb-4 ps-4 pe-4"
    >
      <Col>
        <CountDisplay
          selectedCount={0}
          totalCount={requestFailed ? 0 : resource.meta.recordCount || 0}
          isLoading={loading}
        />
      </Col>

      <Col>
        <Space>
          {showTagFilter && <TagFilter tag="tagged_with" />}
          {!hideSearch && (
            <Search
              placeholder={placeholder || defaultPlaceholder}
              value={resource.getFilteredValue(name)}
              onChange={({ target: { value } }) => { resource.changeFilter(name, value) }}
            />
          )}
          {children}
        </Space>
      </Col>
    </Row>
  )
}
