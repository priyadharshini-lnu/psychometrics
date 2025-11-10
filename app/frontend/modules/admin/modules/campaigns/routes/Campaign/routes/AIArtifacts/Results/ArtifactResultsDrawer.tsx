import React from 'react'
import {
  Drawer, Flex, Typography, Divider,

} from 'antd'
import { useResources } from '~/hooks/useResources'
import styles from '../styles.less'
import { AiArtifact, CampaignAiArtifactDataSource, ArtifactResultsAttributes }
  from '~/modules/admin/modules/campaigns/core/aiArtifacts'
import { GeneratedArtifact } from './GeneratedArtifact'

export interface ArtifactResultsDrawerProps {
  close: () => void
  artifact: CampaignAiArtifactDataSource
  campaignId: string | undefined
}

const { I18n } = window

export const ArtifactResultsDrawer: React.FC<ArtifactResultsDrawerProps> = ({
  close,
  artifact,
  campaignId,
}) => {
  if (!artifact) {
    return null
  }

  const [artifactData, setArtifactData] = React.useState<CampaignAiArtifactDataSource>(artifact)

  const {
    memberAction: memberActionAIArtifactResults,
  } = useResources<AiArtifact>('ai_artifacts', {
    basePath: `campaigns/${campaignId}`,
  })

  const generateResult = async (id:string) => memberActionAIArtifactResults({
    id,
    action: 'generate',
    method: 'post',
    apiConfig: {
      query: {
        user_id: artifact.id,
        save_results: true,
      },
    },
  }).then((res:ArtifactResultsAttributes) => {
    setArtifactData((prevData) => {
      const updatedArtifacts = { ...prevData.artifacts }
      updatedArtifacts[res.artifact.name] = {
        results: res.results,
        error: res.error,
        id: res.artifact.id,
        parsedDependencies: res.parsedDependencies,
        generatedAt: res.generatedAt,
        totalInputTokens: res.totalInputTokens,
        totalOutputTokens: res.totalOutputTokens,
      }

      return {
        ...prevData,
        artifacts: updatedArtifacts,
      }
    })
  }).catch((e) => {
    throw new Error(e.base[0].detail)
  })

  return (
    <Drawer
      title={I18n.t('administration.ai_artifacts.artifact_results')}
      placement="right"
      closable
      onClose={close}
      open
      width="40%"
      className={styles.artifactResultsDrawer}
    >
      <Flex vertical>
        <Flex flex={1} className="p-5">
          <Typography.Title level={5} style={{ textAlign: 'center' }}>{artifactData.name}</Typography.Title>
        </Flex>
        <Divider style={{ margin: 0 }} />
        {Object.keys(artifactData.artifacts).map(artifactName => (
          <GeneratedArtifact
            key={artifactName}
            artifactName={artifactName}
            artifactData={artifactData.artifacts[artifactName]}
            generateResult={generateResult}
          />
        ))}
      </Flex>
    </Drawer>
  )
}
