import {
  FC, useState, useEffect, useCallback,
} from 'react'
import {
  Space, Spin, Select, Tag as AntTag,
} from 'antd'
import _ from 'lodash'
import { useNavigate } from 'react-router-dom'
import { useResources } from '~/hooks/useResources'
import { Tag } from '~/modules/admin/core/tags'
import { TaggableResourceType } from '~/modules/admin/components/Resource/TagFilter/constants'

const { I18n } = window

const MAX_TAG_BATCH_SIZE = 100
const FILTER_NAME = 'taggedWith'

type Props = {
  changeFilter: (filterName: string, filterValue: string[] | string) => void
  removeFilter: (filterName: string) => void
  initialSelectedTags?: string[]
}

export const CampaignTagFilter: FC<Props> = ({
  changeFilter,
  removeFilter,
  initialSelectedTags = [],
}) => {
  const navigate = useNavigate()
  const {
    data: tags,
    fetch: fetchTags,
    isLoading: isTagsLoading,
  } = useResources<Tag>('tags', {
    apiConfig: {
      query: { taggable_resource_type: TaggableResourceType.Campaign },
      page: { size: MAX_TAG_BATCH_SIZE },
    },
  })

  const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags)

  useEffect(() => {
    fetchTags({
      apiConfig: {
        filter: { name_cont: '' },
        fields: { tags: ['name'] },
        page: { size: MAX_TAG_BATCH_SIZE },
      },
    })
  }, [])

  const debouncedFetchTags = useCallback(_.debounce((value: string) => {
    fetchTags({
      apiConfig: {
        filter: { name_cont: value },
        fields: { tags: ['name'] },
        page: { size: MAX_TAG_BATCH_SIZE },
      },
    })
  }, 300), [])

  const updateTagFilterInUrl = (tags: string[]) => {
    const params = new URLSearchParams(window.location.search)

    Array.from(params.keys()).forEach((key) => {
      if (key.startsWith('filters[taggedWith]')) {
        params.delete(key)
      }
    })

    tags.forEach((tag) => {
      params.append('filters[taggedWith][]', tag)
    })

    navigate(
      {
        search: params.toString(),
      },
    )
  }

  const handleTagSelect = (value: string) => {
    const updatedTags = [...selectedTags, value]
    setSelectedTags(updatedTags)
    changeFilter(FILTER_NAME, updatedTags)
    updateTagFilterInUrl(updatedTags)
  }

  const handleTagClose = (removedTag: string) => {
    const updatedTags = selectedTags.filter(tag => tag !== removedTag)
    setSelectedTags(updatedTags)

    if (updatedTags.length === 0) {
      removeFilter(FILTER_NAME)
    } else {
      changeFilter(FILTER_NAME, updatedTags)
    }

    updateTagFilterInUrl(updatedTags)
  }

  const dropdownOptions = tags.filter(({ name }) => !selectedTags.includes(name))

  return (
    <Space>
      <div style={{ marginRight: '10px' }}>
        {selectedTags.map(tag => (
          <AntTag
            key={tag}
            closable
            onClose={() => handleTagClose(tag)}
            style={{ marginBottom: '5px' }}
          >
            {tag}
          </AntTag>
        ))}
      </div>
      <Select
        placeholder={I18n.t('common.actions.filter_by_tags')}
        value={null}
        onChange={handleTagSelect}
        style={{ minWidth: '200px' }}
        showSearch={{ filterOption: false, onSearch: debouncedFetchTags }}
        defaultActiveFirstOption={false}
        notFoundContent={isTagsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
      >
        {dropdownOptions.map(({ name }) => (
          <Select.Option key={name} value={name}>
            {name}
          </Select.Option>
        ))}
      </Select>
    </Space>
  )
}
