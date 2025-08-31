import _ from 'lodash'
import { useState, useEffect, useCallback } from 'react'
import { connect } from 'react-redux'
import { camelizeKeys } from '~/utils/object'
import DataSourceOptionsDropdown from './DataSourceOptionsDropdown'

const { I18n } = window

const connecter = connect(
  ({ report: { builder } }) => ({
    campaignAIArtifacts: camelizeKeys(builder.campaign_ai_artifacts),
  }),
)

const CampaignAIArtifacts = ({ campaignAIArtifacts, modules, onSelect }) => {
  const [selectedArtifact, setSelectedArtifact] = useState(null)

  const findArtifactByCode = useCallback(
    code => campaignAIArtifacts.find(artifact => artifact.code === code),
    [campaignAIArtifacts],
  )

  const initializeFromSource = useCallback(() => {
    const model = modules[0]
    if (model?.props?.source?.code) {
      const artifactCode = model.props.source.code
      const artifact = findArtifactByCode(artifactCode)
      if (artifact) {
        setSelectedArtifact(artifact)
      }
    }
  }, [modules, findArtifactByCode])

  useEffect(() => {
    initializeFromSource()
  }, [initializeFromSource])

  const onArtifactChange = useCallback((data) => {
    const artifact = campaignAIArtifacts.find(a => a.code === data.value)

    setSelectedArtifact(artifact)

    modules.forEach((module) => {
      module.props.source = {
        type: 'CampaignAIArtifacts',
        code: data.value,
      }
    })
    onSelect()
  }, [campaignAIArtifacts, modules, onSelect])

  const onAssistantOutputSchemaKeyChange = useCallback((data) => {
    modules.forEach((module) => {
      module.props.source = {
        type: 'CampaignAIArtifacts',
        code: selectedArtifact.code,
        key: data.value,
      }
    })
    onSelect()
  }, [modules, onSelect, selectedArtifact])

  const getArtifactOptions = useCallback(() => campaignAIArtifacts.map(artifact => ({
    label: artifact.name,
    value: artifact.code,
  })), [campaignAIArtifacts])

  const getAssistantOutputSchemaKeyOptions = useCallback(() => {
    if (!selectedArtifact?.aiAssistant?.assistantOutputSchemaKeys) {
      return []
    }
    return selectedArtifact.aiAssistant.assistantOutputSchemaKeys.map(keyRecord => ({
      label: keyRecord.key,
      value: keyRecord.key,
    }))
  }, [selectedArtifact])

  const getArtifactValue = useCallback(() => {
    const model = modules[0]
    const artifactCode = _.result(model, 'props.source.code')

    if (artifactCode) {
      return {
        value: artifactCode,
        label: artifactCode,
      }
    }
    return null
  }, [modules])

  const getAssistantOutputSchemaKeyValue = useCallback(() => {
    const model = modules[0]
    const assistantOutputSchemaKey = _.result(model, 'props.source.key')

    if (assistantOutputSchemaKey) {
      return {
        value: assistantOutputSchemaKey,
        label: assistantOutputSchemaKey,
      }
    }
    return null
  }, [modules])

  return (
    <div style={{ marginTop: '10px' }}>
      <DataSourceOptionsDropdown
        name="artifact-selector"
        value={getArtifactValue()}
        options={getArtifactOptions()}
        isClearable={false}
        autoFocus={false}
        isMulti={false}
        onChange={onArtifactChange}
        placeholder={I18n.t('administration.ai_assistants.selector.choose_artifact')}
      />

      {!!selectedArtifact && (
        <div style={{ marginTop: '10px' }}>
          <DataSourceOptionsDropdown
            name="schema-key-selector"
            value={getAssistantOutputSchemaKeyValue()}
            options={getAssistantOutputSchemaKeyOptions()}
            isClearable={false}
            autoFocus={false}
            isMulti={false}
            onChange={onAssistantOutputSchemaKeyChange}
            placeholder={I18n.t('administration.ai_assistants.selector.choose_schema_key')}
          />
        </div>
      )}
    </div>
  )
}

export default connecter(CampaignAIArtifacts)
