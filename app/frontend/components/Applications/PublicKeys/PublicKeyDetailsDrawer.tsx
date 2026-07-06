import React from 'react'
import {
  Drawer,
  Descriptions,
  Button,
  Space,
  App,
  Typography,
} from 'antd'
import { CopyOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { PublicKey } from '~/modules/admin/modules/client/core/publicKeys'

const { I18n } = window

type Props = {
  publicKey?: PublicKey
  close: () => void
}

export const PublicKeyDetailsDrawer: React.FC<Props> = ({ publicKey, close }) => {
  const { message } = App.useApp()

  if (!publicKey) {
    return null
  }

  const copy = async (value?: string | null) => {
    if (!value) return

    await navigator.clipboard.writeText(value)
    message.success(I18n.t('shared.copied_to_clipboard'))
  }

  return (
    <Drawer
      title={I18n.t('admin.public_key_details')}
      placement="right"
      closable
      onClose={close}
      open
      size="40%"
    >
      <Typography.Text strong>{I18n.t('shared.jwt_claims_details')}</Typography.Text>
      <Descriptions layout="horizontal" bordered column={1} rootClassName="w-100" className="mt8">
        <Descriptions.Item label={I18n.t('shared.issuer_claim_label')}>
          <Space>
            {publicKey.issuer || '-'}
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => copy(publicKey.issuer)}
            >
              {I18n.t('shared.copy')}
            </Button>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label={I18n.t('shared.key_id_claim_label')}>
          <Space>
            {publicKey.keyId || '-'}
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => copy(publicKey.keyId)}
            >
              {I18n.t('shared.copy')}
            </Button>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label={I18n.t('shared.audience_claim_label')}>
          <Space>
            {publicKey.audience || '-'}
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => copy(publicKey.audience)}
            >
              {I18n.t('shared.copy')}
            </Button>
          </Space>
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  )
}
