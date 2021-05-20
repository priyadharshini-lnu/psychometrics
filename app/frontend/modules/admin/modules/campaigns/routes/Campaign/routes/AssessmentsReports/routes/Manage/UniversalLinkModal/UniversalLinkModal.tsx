import React from 'react'
import {
  Input, Modal, Button, message,
} from 'antd'
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import styles from './styles.scss'

const { I18n } = window

interface Props {
  campaignId: string
  campaignAssessmentId: number
  universalLink: string
  showButtons: boolean
  close(): void
  deactivateUniversalLink(campaignId: string, id: number): void
  regenerateUniversalLink(campaignId: string, id: number): void
}

interface ReportFamily {
  id: number
  name: string
  reports: Report[]
}

interface Report {
  id: number
  name: string
}

const UniversalLinkModal: React.FC<Props> = ({
  campaignId,
  campaignAssessmentId: id,
  universalLink,
  showButtons,
  close,
  deactivateUniversalLink,
  regenerateUniversalLink,
}) => {
  const deactivate = () => {
    deactivateUniversalLink(campaignId, id)
    close()
  }

  const regenerate = () => {
    regenerateUniversalLink(campaignId, id)
  }

  return (
    <Modal
      width={650}
      title="Universal Link"
      visible
      onCancel={close}
      footer={showButtons && [
        <Button key="deactivate" onClick={deactivate}>
          {I18n.t('universal_links.deactivate_link')}
        </Button>,
        <Button key="regenerate" type="primary" onClick={regenerate}>
          {I18n.t('universal_links.regenerate_link')}
        </Button>,
      ]}
    >
      <div>
        <div className={styles.qrcode}>
          <img
            key={universalLink}
            src={`/administration/new_campaigns/${campaignId}/universal_links/${id}.png?type=png&_=${Date.now()}`}
          />
        </div>
        <div className={styles.btns}>
          <a href={`/administration/new_campaigns/${campaignId}/universal_links/${id}.png?type=png`} download>
            <Button className={styles.btn} icon={<DownloadOutlined />}>
              {I18n.t('universal_links.png')}
            </Button>
          </a>
          <a href={`/administration/new_campaigns/${campaignId}/universal_links/${id}.svg?type=svg`} download>
            <Button className={styles.btn} icon={<DownloadOutlined />}>
              {I18n.t('universal_links.svg')}
            </Button>
          </a>
        </div>

        <div className={styles.input}>
          <Input
            value={universalLink}
            suffix={(
              <CopyToClipboard
                text={universalLink}
                onCopy={() => message.info('URL is copied to clipboard successfully')}
              >
                <CopyOutlined />
              </CopyToClipboard>
            )}
          />
        </div>
      </div>
    </Modal>
  )
}

export default UniversalLinkModal
