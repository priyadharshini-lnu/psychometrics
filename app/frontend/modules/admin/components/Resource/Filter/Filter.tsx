import { FC, ReactNode } from 'react'
import {
  Input, Space, Flex, theme,
} from 'antd'
import { SHOW_TITLES } from '~/modules/admin/components/TableLayout'
import { TableTitle } from '~/modules/admin/components/TableTitle'
import { useResourceContext } from '../ResourceContext'
import { TagFilter } from '~/modules/admin/components/Resource/TagFilter'
import { TagFilterConfig } from '~/modules/admin/components/Resource/TagFilter/TagFilter'


const { I18n } = window

const { Search } = Input

type Props = {
  children?: ReactNode
  placeholder?: string
  name: string
  hideSearch?: boolean
  showTagFilter?: boolean
  tagFilterConfig?: TagFilterConfig
  controls?: ReactNode
}

export const Filter: FC<Props> = ({
  children,
  placeholder,
  name,
  hideSearch,
  showTagFilter,
  tagFilterConfig,
  controls,
}) => {
  const { resource, title } = useResourceContext()
  const { token } = theme.useToken()

  const defaultPlaceholder = I18n.t('common.actions.search')

  return (
    <Flex
      wrap
      align="center"
      justify="end"
      gap="middle"
      style={{ paddingInline: token.padding, paddingBlock: token.paddingSM }}
    >
      <Flex flex="auto" align="center">
        {SHOW_TITLES && <TableTitle>{title}</TableTitle>}
      </Flex>

      <Space wrap align="center">
        {controls}
        {showTagFilter && <TagFilter name="tagged_with" config={tagFilterConfig} />}
        {!hideSearch && (
          <Search
            placeholder={placeholder || defaultPlaceholder}
            value={resource.getFilteredValue(name)}
            onChange={({ target: { value } }) => { resource.changeFilter(name, value) }}
          />
        )}
        {children}
      </Space>
    </Flex>
  )
}
