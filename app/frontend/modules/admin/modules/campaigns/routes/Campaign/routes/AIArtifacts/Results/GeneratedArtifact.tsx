
import React from 'react'
import {
  Flex, Typography, Button, Tooltip,
} from 'antd'
import { FileTextOutlined } from '@ant-design/icons'
import ParsedDependenciesModal from './ParsedDependenciesModal'
import { ArtifactResults } from './ArtifactResults'

const { I18n } = window

type GeneratedArtifactProps={
    artifactName: string
    artifactData: {
      results: Array<{
        key: string
        value: string | null
        type: string
      }>
      error: string|null
      id: number
      parsedDependencies: string | null
  }
    generateResult: (id: string) => Promise<void>
}

export const GeneratedArtifact: React.FC<GeneratedArtifactProps> = ({ artifactName, artifactData, generateResult }) => {
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [error, setError] = React.useState<string>(artifactData.error || '')
  const [showParsedDependenciesModal, setShowParsedDependenciesModal] = React.useState(false)

  const handleGenerateResult = async (id:string) => {
    setIsGenerating(true)
    setError('')
    try {
      await generateResult(id)
    } catch (e) {
      setError(e.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Flex className="p-4" key={artifactName} vertical>
      <Flex justify="space-between" flex={1} className="mb-1">
        <Flex>
          <Typography.Title level={4}>{artifactName}</Typography.Title>
          {!error && !isGenerating && (
            <Tooltip title={I18n.t('administration.ai_artifacts.parsed_dependencies.view')}>
              <Button
                type="text"
                icon={<FileTextOutlined />}
                onClick={() => setShowParsedDependenciesModal(true)}
                style={{ marginRight: 8 }}
              />
            </Tooltip>
          )}
        </Flex>
        <Button
          onClick={() => { handleGenerateResult(artifactData.id.toString()) }}
          type="primary"
        >
          {I18n.t('administration.ai_artifacts.generate')}
        </Button>
      </Flex>
      <ArtifactResults
        isLoading={isGenerating}
        error={error}
        artifactResults={artifactData.results}
      />
      <ParsedDependenciesModal
        show={showParsedDependenciesModal}
        content={artifactData.parsedDependencies}
        onClose={() => setShowParsedDependenciesModal(false)}
      />
    </Flex>
  )
}
