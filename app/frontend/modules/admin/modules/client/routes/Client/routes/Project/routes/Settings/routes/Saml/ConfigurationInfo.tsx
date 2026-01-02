import React from 'react'
import {
  Alert, Form, Input, message,
} from 'antd'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { CopyOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

type Props = {
  assertionConsumerServiceUrl: string
  issuer: string
}

const { I18n } = window

export const ConfigurationInfo: React.FC<Props> = ({ assertionConsumerServiceUrl, issuer }) => (
  <Alert
    message={I18n.t('administration.saml_settings.config_details.title')}
    description={(
      <Form layout="vertical">
        <Form.Item
          label={I18n.t('administration.saml_settings.config_details.acs_url')}
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
                    I18n.t('administration.saml_settings.config_details.copied',
                      { element: I18n.t('administration.saml_settings.config_details.acs_url') }),
                  )
                }}
              >
                <CopyOutlined />
              </CopyToClipboard>
            )}
          />
        </Form.Item>

        <Form.Item
          label={I18n.t('administration.saml_settings.config_details.issuer')}
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
                    I18n.t('administration.saml_settings.config_details.copied',
                      { element: I18n.t('administration.saml_settings.config_details.issuer') }),
                  )
                }}
              >
                <CopyOutlined />
              </CopyToClipboard>
            )}
          />
        </Form.Item>
      </Form>
    )}
    type="info"
    showIcon
  />
)
