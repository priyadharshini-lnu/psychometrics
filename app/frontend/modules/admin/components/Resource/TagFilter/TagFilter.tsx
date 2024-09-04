import { FC, useState } from 'react'
import {
  Space, Spin, Select, Tag as TagUIComponent,
} from 'antd'
import { useResourceContext } from '../ResourceContext'
import { useResources } from '~/hooks/useResources'
import { Tag } from '~/modules/admin/modules/client/core/tags'

const { I18n } = window

type Props = {
  placeholder?: string
  tag: string
}

export const TagFilter: FC<Props> = ({
  placeholder,
  tag,
}) => {
  const {
    data: tags,
    fetch: fetchTags,
    isLoading: isTagsLoading,
  } = useResources<Tag>('tags')

  const { resource } = useResourceContext()
  const defaultPlaceholder = I18n.t('common.actions.filter_by_tags')

  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const handleTagSelect = (value: string) => {
    const newSelectedTags = [...selectedTags, value]
    setSelectedTags(newSelectedTags)
    resource.changeFilter(tag, newSelectedTags)
  }

  const handleInputChange = (value: string) => {
    fetchTags({
      apiConfig: {
        filter: { name_cont: value },
        fields: { tags: ['name'] },
      },
    })
  }

  const handleTagClose = (removedTag: string) => {
    const newSelectedTags = selectedTags.filter(tag => tag !== removedTag)
    setSelectedTags(newSelectedTags)
    resource.changeFilter(tag, newSelectedTags)
  }

  // Filter out selected tags from the dropdown options
  const dropdownOptions = tags.filter(({ name }) => !selectedTags.includes(name))

  return (
    <Space>
      <div style={{ marginRight: '10px' }}>
        {selectedTags.map(tag => (
          <TagUIComponent
            key={tag}
            closable
            onClose={() => handleTagClose(tag)}
            style={{ marginBottom: '5px' }}
          >
            {tag}
          </TagUIComponent>
        ))}
      </div>
      <Select
        placeholder={placeholder || defaultPlaceholder}
        value={null} // Set value to null to clear the input field
        onChange={handleTagSelect}
        onSearch={handleInputChange}
        style={{ minWidth: '200px' }}
        showSearch
        filterOption={false}
        defaultActiveFirstOption={false}
        notFoundContent={isTagsLoading('fetch') ? <Spin size="small" /> : null}
      >
        {/* Display only the filtered options */}
        {dropdownOptions.map(({ name }) => (
          <Select.Option key={name} value={name}>
            {name}
          </Select.Option>
        ))}
      </Select>
    </Space>
  )
}
