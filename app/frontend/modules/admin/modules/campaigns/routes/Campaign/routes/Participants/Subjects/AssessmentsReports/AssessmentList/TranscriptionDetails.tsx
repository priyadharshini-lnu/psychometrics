import { FC, useEffect, useState } from 'react'
import {
  Table, Button, Tooltip, Divider, Modal,
} from 'antd'
import { DownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { TableSkeleton } from '~/glint'
import { downloadTextFile } from '~/utils/downloadTextFile'
import { useResources } from '~/hooks/useResources'

const { I18n } = window

interface Assessment {
  id: number
}

interface Props {
  assessment?: Assessment
}

interface MediaResponse {
  id: number
  questionId: number
  transcriptionText: string | null
  questionType: string
  transcriptionStatus: string
  transcriptionEnabled: boolean
  assetAttached: boolean
}

const TranscriptionDetails: FC<Props> = ({
  assessment,
}) => {
  const { collectionAction, memberAction } = useResources('media_responses')
  const [mediaResponses, setMediaResponses] = useState<MediaResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [generatingIds, setGeneratingIds] = useState<Set<number>>(new Set())
  const [confirmModalVisible, setConfirmModalVisible] = useState<boolean>(false)
  const [selectedMediaResponseId, setSelectedMediaResponseId] = useState<number | null>(null)

  useEffect(() => {
    if (assessment?.id) {
      fetchMediaResponses()
    }
  }, [assessment?.id])

  const fetchMediaResponses = async () => {
    if (!assessment?.id) return
    setLoading(true)
    try {
      const result = await collectionAction({
        action: `?user_assessment_id=${assessment.id}`,
        method: 'get',
      }) as MediaResponse[]
      setMediaResponses(result)
    } catch (error) {
      setMediaResponses([])
    } finally {
      setLoading(false)
    }
  }

  const showGenerateConfirmation = (mediaResponseId: number) => {
    setSelectedMediaResponseId(mediaResponseId)
    setConfirmModalVisible(true)
  }

  const handleConfirmGenerate = () => {
    if (selectedMediaResponseId) {
      handleGenerateTranscription(selectedMediaResponseId)
    }
    setConfirmModalVisible(false)
    setSelectedMediaResponseId(null)
  }

  const handleCancelGenerate = () => {
    setConfirmModalVisible(false)
    setSelectedMediaResponseId(null)
  }

  const handleDownloadTranscription = (transcriptionText: string, questionId: number) => {
    if (!transcriptionText || !assessment?.id) return
    downloadTextFile(
      transcriptionText,
      `transcription_${assessment.id}_${questionId}.txt`,
    )
  }

  const handleGenerateTranscription = async (mediaResponseId: number) => {
    setGeneratingIds(prev => new Set(prev).add(mediaResponseId))
    try {
      await memberAction({
        id: mediaResponseId.toString(),
        action: 'generate_transcription',
        method: 'post',
      })
    } catch (error) {
      setGeneratingIds((prev) => {
        const next = new Set(prev)
        next.delete(mediaResponseId)
        return next
      })
    }
  }

  const columns = [
    {
      title: I18n.t('shared.question_id'),
      dataIndex: 'questionId',
      key: 'questionId',
    },
    {
      title: I18n.t('common.column.type'),
      dataIndex: 'questionType',
      key: 'questionType',
      render: (type: string) => (type ? I18n.t(`shared.${type}`) : I18n.t('common.text.na')),
    },
    {
      title: I18n.t('common.column.status'),
      dataIndex: 'transcriptionStatus',
      key: 'transcriptionStatus',
      render: (status: string) => (status ? I18n.t(`shared.${status}`) : I18n.t('common.text.na')),
    },
    {
      title: I18n.t('shared.transcription'),
      key: 'transcriptionText',
      render: (record: MediaResponse) => {
        const {
          id, questionType, transcriptionEnabled, transcriptionText, questionId, transcriptionStatus, assetAttached,
        } = record
        const isAudioOrVideo = questionType === 'audio' || questionType === 'video'
        const hasTranscription = !!transcriptionText
        const isGenerating = generatingIds.has(id) || transcriptionStatus === 'processing'

        if (!assetAttached) {
          return (
            <Tooltip title={I18n.t('shared.asset_not_present')}>
              {I18n.t('common.text.na')}
            </Tooltip>
          )
        }

        if (hasTranscription) {
          return (
            <Button
              className="pn"
              type="link"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadTranscription(transcriptionText, questionId)}
            >
              {I18n.t('shared.download')}
            </Button>
          )
        }

        if (isAudioOrVideo && transcriptionEnabled) {
          if (!isGenerating) {
            return (
              <Button
                className="pn"
                type="link"
                onClick={() => showGenerateConfirmation(id)}
              >
                {I18n.t('shared.generate')}
              </Button>
            )
          }

          return (
            <Button
              className="pn"
              type="link"
              disabled
              loading={isGenerating}
            >
              {I18n.t('shared.generating')}
            </Button>
          )
        }

        return (
          <Tooltip title={I18n.t('shared.transcription_not_enabled')}>
            {I18n.t('common.text.na')}
          </Tooltip>
        )
      },
    },
  ]

  if (loading) {
    return (
      <>
        <Divider />
        <TableSkeleton rowsCount={3} columnsCount={4} cellHeight="40px" />
      </>
    )
  }

  if (!mediaResponses.length) return null

  return (
    <>
      <Table
        rowKey="id"
        dataSource={mediaResponses}
        columns={columns}
        pagination={false}
        title={() => (
          <span className="font-bold">
            {I18n.t('shared.media_question_transcriptions')}
          </span>
        )}
      />
      <Modal
        title={I18n.t('shared.generate_transcription_confirm_title')}
        open={confirmModalVisible}
        closable={false}
        footer={[
          <Button key="cancel" onClick={handleCancelGenerate}>
            {I18n.t('common.actions.cancel')}
          </Button>,
          <Button key="submit" type="primary" onClick={handleConfirmGenerate}>
            {I18n.t('shared.generate')}
          </Button>,
        ]}
      >
        <p>{I18n.t('shared.generate_transcription_confirm_content')}</p>
      </Modal>
    </>
  )
}

export default TranscriptionDetails
