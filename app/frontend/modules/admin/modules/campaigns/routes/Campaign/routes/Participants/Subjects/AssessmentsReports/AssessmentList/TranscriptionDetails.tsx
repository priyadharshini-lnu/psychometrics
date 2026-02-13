import { FC, useEffect, useState } from 'react'
import {
  Table, Button, Divider, Modal, MenuProps,
  message,
} from 'antd'
import { MoreOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { TableSkeleton } from '~/glint'
import { downloadTextFile } from '~/utils/downloadTextFile'
import { useResources } from '~/hooks/useResources'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { MenuItem } from '~/interfaces/Antd'

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
  questionId: number
  transcriptionText: string | null
  questionType: string
  transcriptionStatus: string
  transcriptionEnabled: boolean
  assetUrl: string
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

  const getActionsMenuProps = (record: MediaResponse): MenuProps => {
    const {
      id, questionType, transcriptionEnabled, transcriptionText, questionId, assetUrl,
    } = record
    const isAudioOrVideo = questionType === 'audio' || questionType === 'video'
    const menuItems: MenuItem[] = []

    if (assetUrl) {
      menuItems.push({
        key: 'downloadMedia',
        label: (
          <a href={assetUrl} target="_blank" rel="noopener noreferrer">
            {I18n.t(`shared.download_${questionType}`)}
          </a>
        ),
      })
    }

    if (transcriptionEnabled && transcriptionText) {
      menuItems.push({
        key: 'downloadTranscription',
        label: I18n.t('shared.download_transcription'),
      })
    }

    if (isAudioOrVideo && transcriptionEnabled) {
      menuItems.push({
        key: 'generateTranscription',
        label: I18n.t('admin.generate_transcription'),
      })
    }

    const handleMenuClick = ({ key }) => {
      if (key === 'downloadTranscription') {
        handleDownloadTranscription(transcriptionText, questionId)
      }
      if (key === 'generateTranscription') {
        showGenerateConfirmation(id)
      }
    }

    return { items: menuItems, onClick: handleMenuClick }
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
      title: I18n.t('shared.transcription_status'),
      key: 'transcriptionStatus',
      render: (record: MediaResponse) => {
        const { transcriptionStatus, transcriptionEnabled } = record

        return (
          <span>
            {
              transcriptionEnabled
                ? I18n.t(`shared.${transcriptionStatus}`)
                : I18n.t('shared.question_transcription_disabled')
            }
          </span>
        )
      },
    },
    {
      title: I18n.t('common.column.action'),
      key: 'action',
      render: (record: MediaResponse) => {
        const menu = getActionsMenuProps(record)

        if (!menu.items || menu.items.length === 0) {
          return I18n.t('common.text.na')
        }

        return (
          <ConditionalDropdown
            menu={menu}
            innerElement={(
              <a>
                <MoreOutlined />
              </a>
            )}
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
    </>
  )
}

export default TranscriptionDetails
