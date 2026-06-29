
import React from 'react'
import {
  Flex, Typography, Button, Tooltip,
} from 'antd'
import { formatedDate } from '~/utils/time'
import { FileTextOutlined, InfoCircleFilled } from '~/glint/icons/AccessibleIconsAntDesign'
import ParsedDependenciesModal from './ParsedDependenciesModal'
import { ArtifactResults } from './ArtifactResults'
import styles from '../styles.less'

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
      totalInputTokens: number | undefined
      totalOutputTokens: number | undefined
      generatedAt: string | null
      resultStale: boolean
  }
    generateResult: (id: string, setIsGenerating: (value: boolean) => void) => void
}

export const GeneratedArtifact: React.FC<GeneratedArtifactProps> = ({ artifactName, artifactData, generateResult }) => {
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [showParsedDependenciesModal, setShowParsedDependenciesModal] = React.useState(false)

  const handleGenerateResult = (id: string) => {
    generateResult(id, setIsGenerating)
  }

  return (
    <Flex className="p-4" key={artifactName} vertical>
      <Flex justify="space-between" flex={1} className="mb-1">
        <Flex>
          <Typography.Title level={4}>{artifactName}</Typography.Title>
          {!isGenerating && artifactData.resultStale && (
            <Tooltip title={I18n.t('admin.ai_artifact_result_stale')}>
              <span>
                <InfoCircleFilled className={styles.warning} />
              </span>
            </Tooltip>
          )}
          {artifactData.parsedDependencies && !isGenerating && (
            <Tooltip title={I18n.t('admin.parsed_dependencies_view')}>
              <Button
                type="text"
                icon={<FileTextOutlined />}
                onClick={() => setShowParsedDependenciesModal(true)}
              />
            </Tooltip>
          )}
        </Flex>
        <Button
          onClick={() => { handleGenerateResult(artifactData.id.toString()) }}
          type="primary"
          loading={isGenerating}
        >
          {I18n.t('shared.generate')}
        </Button>
      </Flex>
      {!isGenerating && (
        <Typography.Text type="secondary">
          {I18n.t('admin.generated_at_time',
            { time: formatedDate(artifactData.generatedAt) })}
        </Typography.Text>
      )}
      <ArtifactResults
        isLoading={isGenerating}
        error={artifactData.error || ''}
        artifactResults={artifactData.results}
        totalInputTokens={artifactData.totalInputTokens}
        totalOutputTokens={artifactData.totalOutputTokens}
      />
      <ParsedDependenciesModal
        show={showParsedDependenciesModal}
        content={artifactData.parsedDependencies}
        onClose={() => setShowParsedDependenciesModal(false)}
      />
    </Flex>
  )
}
