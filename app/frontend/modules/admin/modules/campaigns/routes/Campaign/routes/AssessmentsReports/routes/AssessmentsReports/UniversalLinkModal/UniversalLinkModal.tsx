import React, { useState } from 'react'
import {
  Input, Modal, Button, Switch, App,
} from 'antd'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { CopyOutlined, DownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import styles from './styles.less'
import { useUpdateEffect } from '~/hooks/useUpdateEffect'

const { I18n } = window

interface Props {
  campaignId: string
  campaignAssessmentId: number
  universalLink: string
  enableUniversalLinks: boolean
  allowMultipleResponses: boolean
  close(): void
  saveUniversalLink(campaignId: string, id: number, data): Promise<{response: unknown}>
  regenerateUniversalLink(campaignId: string, id: number): Promise<{response: unknown}>
()
}

const UniversalLinkModal: React.FC<Props> = ({
  campaignId,
  campaignAssessmentId: id,
  universalLink,
  enableUniversalLinks,
  allowMultipleResponses,
  close,
  saveUniversalLink,
  regenerateUniversalLink,
}) => {
  const [multipleResponses, setMultipleResponses] = useState(allowMultipleResponses)
  const [active, setActive] = useState(enableUniversalLinks)
  const { message, modal } = App.useApp()

  const save = () => {
    saveUniversalLink(campaignId, id, { active, allowMultipleResponses: multipleResponses }).then(() => {
      message.info(I18n.t('universal_links.successfully_updated'))
    })
  }

  useUpdateEffect(() => {
    save()
  }, [multipleResponses, active])

  const regenerate = () => {
    modal.confirm({
      title: I18n.t('shared.confirm'),
      content: 'Are you sure? This will make the existing URL unusable.',
      onOk: async () => {
        regenerateUniversalLink(campaignId, id).then(() => {
          message.info(I18n.t('universal_links.successfully_generated'))
        }).catch((error) => {
          message.error(error)
        })
      },
    })
  }

  return (
    <Modal
      width={650}
      title="Universal Link"
      open
      onCancel={close}
      footer={null}
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

        <div className={styles.controls}>
          <div className={styles.link}>
            <Input
              value={universalLink}
              className={styles.input}
              suffix={(
                <CopyToClipboard
                  text={universalLink}
                  onCopy={() => message.info('URL is copied to clipboard successfully')}
                >
                  <CopyOutlined />
                </CopyToClipboard>
            )}
            />
            <Button key="regenerate" type="primary" onClick={regenerate}>
              {I18n.t('universal_links.regenerate_link')}
            </Button>

          </div>

          <div className={styles.checkbox}>
            <Switch onChange={() => setMultipleResponses(!multipleResponses)} checked={multipleResponses} />
            {' '}
            {I18n.t('universal_links.allow_multiple_respones')}
          </div>
          <div className={styles.checkbox}>
            <Switch onChange={() => setActive(!active)} checked={active} />
            {' '}
            {I18n.t('shared.active')}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default UniversalLinkModal
