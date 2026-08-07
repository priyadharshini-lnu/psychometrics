import React from 'react'
import {
  Alert, Form, Input, message, Button,
} from 'antd'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { CopyOutlined, DownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

type Props = {
  assertionConsumerServiceUrl: string
  issuer: string
}

const { I18n } = window

export const ConfigurationInfo: React.FC<Props> = ({ assertionConsumerServiceUrl, issuer }) => (
  <Alert
    message={I18n.t('admin.saml_settings_config_details_title')}
    description={(
      <Form layout="vertical">
        <Form.Item
          label={I18n.t('admin.saml_settings_config_details_acs_url')}
          initialValue={assertionConsumerServiceUrl}
          name="acsUrl"
        >
          <Input
            readOnly
            suffix={(
              <CopyToClipboard
                text={assertionConsumerServiceUrl}
                onCopy={() => {
                  message.info(
                    I18n.t('admin.saml_settings_config_details_copied',
                      { element: I18n.t('admin.saml_settings_config_details_acs_url') }),
                  )
                }}
              >
                <CopyOutlined />
              </CopyToClipboard>
            )}
          />
        </Form.Item>

        <Form.Item
          label={I18n.t('admin.saml_settings_config_details_issuer')}
          initialValue={issuer}
          name="issuer"
        >
          <Input
            readOnly
            suffix={(
              <CopyToClipboard
                text={issuer}
                onCopy={() => {
                  message.info(
                    I18n.t('admin.saml_settings_config_details_copied',
                      { element: I18n.t('admin.saml_settings_config_details_issuer') }),
                  )
                }}
              >
                <CopyOutlined />
              </CopyToClipboard>
            )}
          />
        </Form.Item>

        <div style={{ marginTop: 16 }}>
          <Button href={`${issuer}?download=true`} type="default" icon={<DownloadOutlined />}>
            {I18n.t('admin.saml_settings_download_metadata')}
          </Button>
        </div>
      </Form>
    )}
    type="info"
    showIcon
  />
)
