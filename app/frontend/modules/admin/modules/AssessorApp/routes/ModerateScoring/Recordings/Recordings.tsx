/* eslint-disable max-len */
import React, { useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Button,
  Tooltip,
  Modal,
  Skeleton,
  Space,
  Typography,
} from 'antd'
import { useParams } from 'react-router-dom'
import { DownloadOutlined } from '@ant-design/icons'
import { DateTimeWithZone } from '~/glint'
import { RootState } from '~/modules/admin/core/rootReducers'
import styles from './styles.less'
import { isRequestInProgress } from '~/core/request'
import { getRecordings, FETCH_RECORDINGS, fetchRecordings } from '../../../core/scoreModerate'


export type PropsFromRedux = ConnectedProps<typeof connector>

const connector = connect((state: RootState) => ({
  userRecordings: getRecordings(state.assessors.scoreModerate),
  loading: isRequestInProgress(state, FETCH_RECORDINGS),
}), {
  fetchRecordings,
})

interface Props extends ConnectedProps<typeof connector> {
  header: (title: string) => React.ReactNode
}

const { I18n } = window

const Recordings: React.FC<Props> = ({ userRecordings, fetchRecordings, header }) => {
  let parsedCampaignId
  let parsedUserId

  const { campaignId, userId } = useParams<{ campaignId?: string, userId?: string }>()
  if (campaignId) { parsedCampaignId = parseInt(campaignId, 10) }
  if (userId) { parsedUserId = parseInt(userId, 10) }

  useEffect(() => {
    fetchRecordings(parsedCampaignId, parsedUserId)
  }, [])

  if (!userRecordings) {
    return (
      <div className={styles.sidebar}>
        <Skeleton active />
      </div>
    )
  }

  return (
    <div className={styles.sidebar}>
      {header(I18n.t('administration.assessor.moderate_score.recordings'))}
      <div className={styles.content}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {userRecordings.map(recording => (
            <div className={styles.group} key={recording.id}>
              <div className={styles.groupTitle}>
                <DateTimeWithZone dateString={recording.assessmentCenterDateAndTime} />
              </div>
              <div className={styles.groupColumn}>
                <Typography.Text strong>
                  {I18n.t('administration.scheduling.columns.assessor')}
                  {': '}
                </Typography.Text>
                <ContactList contacts={recording.assessors} />
              </div>
              <div className={styles.groupColumn}>
                <Typography.Text strong>
                  {I18n.t('administration.scheduling.columns.participants')}
                  {': '}
                </Typography.Text>
                <ContactList contacts={recording.participants} />
              </div>
              <div>
                <RecordingUrlColumn
                  recordingUrl={recording.recordingUrl}
                  recordingDate={recording.recordingDate}
                  serialNo={recording.id}
                />
              </div>
              {recording.transcriptionUrl && (
                <div className={styles.groupColumn}>
                  <Typography.Text strong>
                    {I18n.t('shared.transcriptions')}
                    {': '}
                  </Typography.Text>
                  <Button
                    className="ps-0"
                    href={recording.transcriptionUrl}
                    target="_blank"
                    icon={<DownloadOutlined />}
                    type="link"
                  >
                    {I18n.t('common.text.download')}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </Space>
      </div>
    </div>
  )
}

const RecordingPlayer: React.FC<{ url: string }> = ({ url }) => (
  <video
    src={url}
    controls
    controlsList="nodownload"
    style={{ width: '100%' }}
    onContextMenu={e => e.preventDefault()}
  />
)

const RecordingUrlColumn: React.FC<{
  recordingUrl: string
  recordingDate: string
  serialNo: number | string
}> = ({ recordingUrl, recordingDate, serialNo }) => {
  const [open, setOpen] = useState(false)

  if (!recordingUrl) return <span>NA</span>

  return (
    <>
      <Button
        style={{ padding: '0px' }}
        type="link"
        onClick={() => setOpen(true)}
      >
        {I18n.t('administration.scheduling.columns.view_recording')}
      </Button>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={800}
        title={`Recording #${serialNo} - ${recordingDate}`}
        destroyOnClose
      >
        <RecordingPlayer url={recordingUrl} />
      </Modal>
    </>
  )
}

const ContactList: React.FC<{ contacts: Array<{ name: string, email: string }> }> = ({ contacts }) => {
  if (!contacts || contacts.length === 0) return null
  const maxShown = 1
  const shown = contacts.slice(0, maxShown)
  const hidden = contacts.slice(maxShown)
  const emails = contacts.map(a => a.email).join(', ')
  return (
    <Tooltip title={emails}>
      <span>
        {shown.map(contact => contact.email).join(', ')}
        {hidden.length > 0 && (
          <>{`+ ${hidden.length}`}</>
        )}
      </span>
    </Tooltip>
  )
}

export default connector(Recordings)
