import React, { useState } from 'react'
import {
  Input, Modal, Button, message, Switch,
} from 'antd'
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import styles from './styles.less'

const { I18n } = window

interface Props {
  campaignId: string
  campaignAssessmentId: number
  universalLink: string
  manageUniversalLink: boolean
  allowMultipleResponses: boolean
  close(): void
  deactivateUniversalLink(campaignId: string, id: number): void
  regenerateUniversalLink(campaignId: string, id: number): void
  toggleMultipleResponses(campaignId: string, id: number): Promise<{response: unknown}>
()
}

const UniversalLinkModal: React.FC<Props> = ({
  campaignId,
  campaignAssessmentId: id,
  universalLink,
  manageUniversalLink,
  allowMultipleResponses,
  close,
  deactivateUniversalLink,
  regenerateUniversalLink,
  toggleMultipleResponses,
}) => {
  const [multipleResponses, setMultipleResponses] = useState(allowMultipleResponses)

  const deactivate = () => {
    deactivateUniversalLink(campaignId, id)
    close()
  }

  const regenerate = () => {
    regenerateUniversalLink(campaignId, id)
  }

  const onToggleMultipleResponses = () => {
    toggleMultipleResponses(campaignId, id).then(() => {
      message.success(I18n.t('universal_links.successfully_updated'))
      setMultipleResponses(!multipleResponses)
    })
  }

  return (
    <Modal
      width={650}
      title="Universal Link"
      open
      onCancel={close}
      footer={manageUniversalLink ? [
        <Button key="deactivate" onClick={deactivate}>
          {I18n.t('universal_links.deactivate_link')}
        </Button>,
        <Button key="regenerate" type="primary" onClick={regenerate}>
          {I18n.t('universal_links.regenerate_link')}
        </Button>,
      ] : [
        <Button key="universal_link_close" onClick={close}>
          {I18n.t('universal_links.close')}
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
          <div className={styles.checkbox}>
            <Switch onChange={onToggleMultipleResponses} checked={multipleResponses} />
            {' '}
            {I18n.t('universal_links.allow_multiple_respones')}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default UniversalLinkModal
