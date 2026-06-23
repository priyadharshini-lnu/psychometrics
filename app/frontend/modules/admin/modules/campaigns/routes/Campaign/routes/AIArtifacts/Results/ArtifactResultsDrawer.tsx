import React from 'react'
import {
  Drawer, Flex, Typography, Divider, App,

} from 'antd'
import useAsyncRequestResponse from '~/hooks/useAsyncRequestResponse'
import styles from '../styles.less'
import {
  CampaignAiArtifactDataSource,
  CampaignAiArtifactResult,
  AsyncArtifactResultResponseTR,
  ArtifactResultResponseData,
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

  const { modal } = App.useApp()

  const [artifactData, setArtifactData] = React.useState<CampaignAiArtifactDataSource>(userArtifactsResults)

  const handleSuccess = (responseData: ArtifactResultResponseData) => {
    const res = responseData.data.attributes

    setArtifactData((prevData) => {
      const updatedArtifacts = { ...prevData.artifacts }
      updatedArtifacts[res.artifact.name] = {
        ...res,
        id: res.artifact.id,
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
          artifactResultsFinalizedAt: responseData.meta.artifactResultsFinalizedAt,
        }
      }
      return record
    })

    updateRawTableData(updatedTableData)
  }

  const handleError = ({
    errorMessage,
    artifactId,
    parsedDependencies = null as string | null,
  }) => {
    // Update drawer state with error for the specific artifact
    setArtifactData((prevData) => {
      const updatedArtifacts = { ...prevData.artifacts }
      Object.keys(updatedArtifacts).forEach((key) => {
        if (updatedArtifacts[key].id.toString() === artifactId) {
          updatedArtifacts[key] = {
            ...updatedArtifacts[key],
            error: errorMessage,
            parsedDependencies,
          }
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
            data: record.artifactsResults.data.map((item) => {
              if (item.attributes.artifact.id.toString() === artifactId) {
                return {
                  ...item,
                  attributes: {
                    ...item.attributes,
                    error: errorMessage,
                  },
                }
              }
              return item
            }),
          },
        }
      }
      return record
    })

    updateRawTableData(updatedTableData)
  }

  const { makeAsyncRequest } = useAsyncRequestResponse({
    url: `/api/v2/administration/campaigns/${campaignId}/ai_artifacts/generate`,
    responseType: AsyncArtifactResultResponseTR,
    pollingInterval: 3,
    numberOfTimesToPoll: 60,
  })

  const generateResult = async (id: string) => {
    try {
      const response = await makeAsyncRequest({
        artifact_id: id,
        user_id: userArtifactsResults.id,
      })

      const responseData = response.responseData as ArtifactResultResponseData

      if (responseData.data.attributes.error) {
        handleError({
          errorMessage: responseData.data.attributes.error,
          artifactId: id,
          parsedDependencies: responseData.data.attributes.parsedDependencies,
        })
      }

      handleSuccess(responseData)
    } catch (e) {
      const errorMessage = e?.message || I18n.t('shared.something_wrong')
      handleError({ errorMessage, artifactId: id })
    }
  }

  const generateResultWithConfirm = (id: string, setIsGenerating: (value: boolean) => void) => {
    modal.confirm({
      title: I18n.t('admin.generate_results'),
      content: I18n.t('admin.generate_result_confirm', { email: userArtifactsResults.email }),
      onOk: () => {
        setIsGenerating(true)
        generateResult(id).finally(() => setIsGenerating(false))
      },
    })
  }

  return (
    <Drawer
      title={I18n.t('admin.artifact_results')}
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
              generateResult={generateResultWithConfirm}
            />
          ))}
      </Flex>
    </Drawer>
  )
}
