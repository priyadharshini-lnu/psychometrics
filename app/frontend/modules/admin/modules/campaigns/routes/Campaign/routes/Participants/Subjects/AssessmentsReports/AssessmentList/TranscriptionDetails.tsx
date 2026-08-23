import { FC, useEffect, useState } from 'react'
import {
  Table, Button, Divider, Modal, MenuProps,
  message, Tooltip,
} from 'antd'
import {
  InfoCircleOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { TableSkeleton } from '~/glint'
import { downloadTextFile } from '~/utils/downloadTextFile'
import { useResources } from '~/hooks/useResources'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { MenuItem } from '~/interfaces/Antd'
import MediaPreviewModal from './MediaPreviewModal'

const { I18n } = window

interface Assessment {
  id: number
}

interface Props {
  assessment?: Assessment
  campaignId: string
}

interface MediaResponse {
  id: string
  mediaId: number
  questionId: number
  questionText: string | null
  questionName: string | null
  transcriptionText: string | null
  questionType: string
  transcriptionStatus: string
  transcriptionEnabled: boolean
  assetUrl: string
  errorDetails?: { message: string }
}

const TranscriptionDetails: FC<Props> = ({
  assessment,
  campaignId,
}) => {
  const { collectionAction, memberAction } = useResources('media_responses')
  const [mediaResponses, setMediaResponses] = useState<MediaResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [confirmModalVisible, setConfirmModalVisible] = useState<boolean>(false)
  const [selectedMediaResponseId, setSelectedMediaResponseId] = useState<string | null>(null)
  const [mediaPreviewOpen, setMediaPreviewOpen] = useState<boolean>(false)
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string>('')
  const [selectedMediaForPreview, setSelectedMediaForPreview] = useState<MediaResponse | null>(null)

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

  const showGenerateConfirmation = (mediaResponseId: string) => {
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

  const handleDownloadTranscription = (transcriptionText: string | null, questionId: number) => {
    if (!transcriptionText || !assessment?.id) return
    downloadTextFile(
      transcriptionText,
      `transcription_${assessment.id}_${questionId}.txt`,
    )
  }

  const handleGenerateTranscription = async (mediaResponseId: string) => {
    try {
      await memberAction({
        id: mediaResponseId,
        action: `generate_transcription?campaign_id=${campaignId}`,
        method: 'post',
      })
      message.success(I18n.t('admin.transcription_scheduled'))
    } catch (error) {
      message.error(I18n.t('admin.transcription_schedule_failed'))
    }
  }

  const openMediaPreview = (record: MediaResponse) => {
    setSelectedMediaUrl(record.assetUrl)
    setSelectedMediaForPreview(record)
    setMediaPreviewOpen(true)
  }

  const closeMediaPreview = () => {
    setMediaPreviewOpen(false)
    setSelectedMediaUrl('')
    setSelectedMediaForPreview(null)
  }

  const getActionsMenuProps = (record: MediaResponse): MenuProps => {
    const {
      id, questionType, transcriptionEnabled, assetUrl,
    } = record
    const normalizedQuestionType = questionType?.toLowerCase()
    const isAudioOrVideo = normalizedQuestionType === 'audio' || normalizedQuestionType === 'video'
    const menuItems: MenuItem[] = []

    if (isAudioOrVideo && assetUrl) {
      menuItems.push({
        key: 'downloadMedia',
        label: (
          <a href={assetUrl} target="_blank" rel="noopener noreferrer">
            {I18n.t(`shared.download_${normalizedQuestionType}`)}
          </a>
        ),
      })
    }

    if (isAudioOrVideo && transcriptionEnabled) {
      menuItems.push({
        key: 'generateTranscription',
        label: I18n.t('admin.generate_transcription'),
      })
    }

    const handleMenuClick = ({ key }) => {
      if (key === 'generateTranscription') {
        showGenerateConfirmation(id)
      }
    }

    return { items: menuItems, onClick: handleMenuClick }
  }

  const columns = [
    {
      title: I18n.t('shared.media_id'),
      dataIndex: 'mediaId',
      key: 'mediaId',
      width: 90,
      render: (mediaId: number, record: MediaResponse) => (
        record.assetUrl ? (
          <Button type="link" size="small" className="p-0" onClick={() => openMediaPreview(record)}>
            {mediaId}
          </Button>
        ) : mediaId
      ),
    },
    {
      title: I18n.t('shared.question_id'),
      dataIndex: 'questionId',
      key: 'questionId',
      width: 110,
    },
    {
      title: I18n.t('shared.question'),
      key: 'questionText',
      ellipsis: true,
      render: (_: unknown, record: MediaResponse) => {
        const { questionText, questionName } = record
        if (!questionText) return I18n.t('common.text.na')

        const displayText = questionName ? `${questionName} - ${questionText}` : questionText
        return (
          <Tooltip title={displayText} placement="topLeft">
            <span style={{ cursor: 'pointer' }}>{displayText}</span>
          </Tooltip>
        )
      },
    },
    {
      title: I18n.t('common.column.type'),
      dataIndex: 'questionType',
      key: 'questionType',
      width: 80,
      render: (type: string) => {
        if (!type) return I18n.t('common.text.na')
        const knownTypes = ['audio', 'video', 'file']
        if (knownTypes.includes(type.toLowerCase())) {
          return I18n.t(`shared.${type.toLowerCase()}`)
        }
        return type
      },
    },
    {
      title: I18n.t('shared.transcription_status'),
      key: 'transcriptionStatus',
      width: 140,
      render: (_: unknown, record: MediaResponse) => {
        const { transcriptionStatus, transcriptionEnabled, errorDetails } = record

        if (!transcriptionEnabled) {
          return <span>{I18n.t('shared.question_transcription_disabled')}</span>
        }

        return (
          <span>
            {I18n.t(`shared.${transcriptionStatus}`)}
            {transcriptionStatus === 'failed' && errorDetails?.message && (
              <Tooltip title={errorDetails.message}>
                <span className="ms-1">
                  <InfoCircleOutlined style={{ cursor: 'pointer' }} />
                </span>
              </Tooltip>
            )}
          </span>
        )
      },
    },
    {
      title: I18n.t('common.column.action'),
      key: 'action',
      width: 80,
      render: (_: unknown, record: MediaResponse) => {
        const normalizedQuestionType = record.questionType?.toLowerCase()
        const isAudioOrVideo = normalizedQuestionType === 'audio' || normalizedQuestionType === 'video'
        if (!isAudioOrVideo) {
          return I18n.t('common.text.na')
        }

        const menu = getActionsMenuProps(record)

        if (!menu.items || menu.items.length === 0) {
          return I18n.t('common.text.na')
        }

        return (
          <ConditionalDropdown
            menu={menu}
          />
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
            {I18n.t('shared.media_responses')}
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
      <MediaPreviewModal
        open={mediaPreviewOpen}
        onClose={closeMediaPreview}
        mediaUrl={selectedMediaUrl}
        mediaResponse={selectedMediaForPreview}
        transcriptionText={selectedMediaForPreview?.transcriptionText}
        transcriptionEnabled={selectedMediaForPreview?.transcriptionEnabled}
        onDownloadTranscription={() => {
          if (selectedMediaForPreview) {
            handleDownloadTranscription(
              selectedMediaForPreview.transcriptionText,
              selectedMediaForPreview.questionId,
            )
          }
        }}
      />
    </>
  )
}

export default TranscriptionDetails
