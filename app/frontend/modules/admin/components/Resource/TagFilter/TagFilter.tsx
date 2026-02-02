import {
  FC, useState, useEffect, useCallback,
} from 'react'
import {
  Space, Spin, Select, Tag as TagUIComponent,
} from 'antd'
import _ from 'lodash'
import { useResourceContext } from '../ResourceContext'
import { useResources } from '~/hooks/useResources'
import { Tag } from '~/modules/admin/modules/client/core/tags'
import { TaggableResourceType } from './constants'

const { I18n } = window

const MAX_TAG_BATCH_SIZE = 100

export type TagFilterConfig = {
  taggable_resource_type: TaggableResourceType.Assessment | TaggableResourceType.Report | TaggableResourceType.Skill
}

type Props = {
  placeholder?: string
  name: string,
  config?: TagFilterConfig
}

export const TagFilter: FC<Props> = ({
  placeholder,
  name,
  config = { taggable_resource_type: '' },
}) => {
  const {
    data: tags,
    fetch: fetchTags,
    isLoading: isTagsLoading,
  } = useResources<Tag>('tags', {
    apiConfig: {
      query: config,
      page: {
        size: MAX_TAG_BATCH_SIZE,
      },
    },
  })

  const { resource } = useResourceContext()

  const defaultPlaceholder = I18n.t('common.actions.filter_by_tags')

  const [selectedTags, setSelectedTags] = useState<string[]>(resource.getFilteredValue(name) as string[] || [])

  useEffect(() => {
    fetchTags({
      apiConfig: {
        filter: { name_cont: '' },
        fields: { tags: ['name'] },
        page: {
          size: MAX_TAG_BATCH_SIZE,
        },
      },
    })
  }, [resource])

  const handleTagSelect = (value: string) => {
    const newSelectedTags = [...selectedTags, value]
    setSelectedTags(newSelectedTags)
    resource.changeFilter(name, newSelectedTags)
  }

  const debouncedFetchTags = useCallback(_.debounce((value) => {
    fetchTags({
      apiConfig: {
        filter: { name_cont: value },
        fields: { tags: ['name'] },
        page: {
          size: MAX_TAG_BATCH_SIZE,
        },
      },
    })
  }, 300), [])

  const handleInputChange = (value: string) => {
    debouncedFetchTags(value)
  }

  const handleTagClose = (removedTag: string) => {
    const newSelectedTags = selectedTags.filter(tag => tag !== removedTag)
    setSelectedTags(newSelectedTags)
    resource.changeFilter(name, newSelectedTags)
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
        style={{ minWidth: '200px' }}
        showSearch={{ filterOption: false, onSearch: handleInputChange }}
        defaultActiveFirstOption={false}
        notFoundContent={isTagsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
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
