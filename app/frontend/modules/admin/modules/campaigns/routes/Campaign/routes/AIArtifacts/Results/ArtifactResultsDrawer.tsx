import React from 'react'
import {
  Drawer, Flex, Typography, Divider,

} from 'antd'
import { useResources } from '~/hooks/useResources'
import styles from '../styles.less'
import {
  AiArtifact, CampaignAiArtifactDataSource, ArtifactResultsAttributes, CampaignAiArtifactResult,
}
  from '~/modules/admin/modules/campaigns/core/aiArtifacts'
import { GeneratedArtifact } from './GeneratedArtifact'

export interface ArtifactResultsDrawerProps {
  close: () => void
  userArtifactsResults: CampaignAiArtifactDataSource
  campaignId: string | undefined
  rawTableData: CampaignAiArtifactResult[]
  updateRawTableData: (data: CampaignAiArtifactResult[]) => void
}

const { I18n } = window

export const ArtifactResultsDrawer: React.FC<ArtifactResultsDrawerProps> = ({
  close,
  userArtifactsResults,
  campaignId,
  rawTableData,
  updateRawTableData,
}) => {
  if (!userArtifactsResults) {
    return null
  }

  const [artifactData, setArtifactData] = React.useState<CampaignAiArtifactDataSource>(userArtifactsResults)

  const {
    memberAction: memberActionAIArtifactResults,
  } = useResources<AiArtifact>('ai_artifacts', {
    basePath: `campaigns/${campaignId}`,
  })

  const generateResult = async (id: string) => memberActionAIArtifactResults({
    id,
    action: 'generate',
    method: 'post',
    apiConfig: {
      query: {
        user_id: userArtifactsResults.id,
        save_results: true,
      },
    },
  })
    .then((res: ArtifactResultsAttributes) => {
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

      // Update listing page's local state
      const updatedTableData = rawTableData.map((record) => {
        if (record.user.data.id === userArtifactsResults.participantId) {
          return {
            ...record,
            artifactsResults: {
              ...record.artifactsResults,
              data: record.artifactsResults.data.map((item) => {
                if (item.attributes.artifact.id === res.artifact.id) {
                  return { ...item, attributes: res }
                }
                return item
              }),
            },
            generatedAt: res.generatedAt,
          }
        }
        return record
      })

      updateRawTableData(updatedTableData)
    })
    .catch((e) => {
      const errorMessage = e.base[0].detail

      // Update drawer state with error
      setArtifactData((prevData) => {
        const updatedArtifacts = { ...prevData.artifacts }
        Object.keys(updatedArtifacts).forEach((key) => {
          updatedArtifacts[key] = {
            ...updatedArtifacts[key],
            error: errorMessage,
          }
        })

        return {
          ...prevData,
          artifacts: updatedArtifacts,
        }
      })

      // Update listing page's local state
      const updatedTableData = rawTableData.map((record) => {
        if (record.user.data.id === userArtifactsResults.participantId) {
          return {
            ...record,
            artifactsResults: {
              ...record.artifactsResults,
              data: record.artifactsResults.data.map(item => ({
                ...item,
                attributes: {
                  ...item.attributes,
                  error: errorMessage,
                },
              })),
            },
          }
        }
        return record
      })

      updateRawTableData(updatedTableData)

      throw new Error(errorMessage)
    })

  return (
    <Drawer
      title={I18n.t('administration.ai_artifacts.artifact_results')}
      placement="right"
      closable
      onClose={close}
      open
      size="large"
      className={styles.artifactResultsDrawer}
    >
      <Flex vertical>
        <Flex flex={1} vertical className="p-5">
          <Typography.Title level={5}>{artifactData.name}</Typography.Title>
          <Typography.Text>{artifactData.email}</Typography.Text>
        </Flex>
        <Divider style={{ margin: 0 }} />
        {Object.keys(artifactData.artifacts)
          .map(artifactName => (
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
