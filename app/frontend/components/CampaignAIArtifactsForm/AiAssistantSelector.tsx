import React from 'react'
import { Select } from 'antd'
import { debounce } from 'lodash'
import { useResources } from '~/hooks/useResources'
import { AiAssistantTR, AiAssistant } from '~/modules/admin/modules/AiAssitant/core/aiAssistant'
import { ASSISTANT_TYPES } from '~/modules/admin/modules/AiAssitant/core/constants'

type Props = {
  value?: number
  selectedLabel?: string
  onChange?: (assistantId: number, assistant: AiAssistant) => void
  className?: string
}

const { I18n } = window

export const AIAssistantSelector: React.FC<Props> = ({
  value,
  selectedLabel,
  onChange,
  className,
}) => {
  const { fetch: fetchAIAssistants, data: aiAssistants, isLoading } = useResources<AiAssistant>('assistants', {
    basePath: '/ai',
    responseType: AiAssistantTR,
    apiConfig: {
      include: ['assistant_output_schema_keys'],
    },
  })

  const fetchAiAssistantsByValue = (searchValue: string) => fetchAIAssistants({
    apiConfig: {
      include: ['assistant_output_schema_keys'],
      filter: {
        filterable_fields: searchValue,
        assistant_type_eq: ASSISTANT_TYPES.content_writer.id,
      },
    },
  })

  const handleSearch = debounce((searchValue: string) => {
    fetchAiAssistantsByValue(searchValue)
  }, 300)

  const handleChange = (assistantId: number) => {
    const selectedAssistant = aiAssistants.find(assistant => parseInt(assistant.id, 10) === assistantId)
    if (selectedAssistant && onChange) {
      onChange(assistantId, selectedAssistant)
    }
  }

  const getOptions = () => {
    const options = aiAssistants.map(assistant => ({
      label: assistant.name,
      value: parseInt(assistant.id, 10),
    }))

    if (value && selectedLabel && !options.find(option => option.value === value)) {
      options.unshift({
        label: selectedLabel,
        value,
      })
    }

    return options
  }

  return (
    <Select
      showSearch={{ filterOption: false, onSearch: handleSearch }}
      value={value}
      placeholder={I18n.t('administration.ai_assistants.selector.placeholder')}
      loading={isLoading('fetch')}
      onChange={handleChange}
      className={className}
      options={getOptions()}
      notFoundContent={
        isLoading('fetch')
          ? I18n.t('administration.common.loading')
          : I18n.t('administration.ai_assistants.selector.no_assistants_found')
      }
    />
  )
}
