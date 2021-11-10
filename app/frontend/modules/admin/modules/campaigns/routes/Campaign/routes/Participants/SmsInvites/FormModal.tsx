import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from 'modules/admin/core/rootReducers'
import { Form, Input, Select } from 'antd'
import ResourceFormModal from 'components/ResourceFormModal'
import { availableLocales } from 'core/config'
import { SmsInvite } from 'modules/admin/modules/campaigns/core/smsInvites'

const connecter = connect(
  (state: RootState) => ({
    availableLocales: availableLocales(state),
  }),
  {
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>
interface OwnProps {
  campaignId: number
  close(): void
  smsInvite: SmsInvite
}
type Props = PropsFromRedux & OwnProps

const { I18n } = window

const FormModalComponent: React.FC<Props> = ({
  campaignId,
  close,
  availableLocales,
  smsInvite,
}) => (
  <ResourceFormModal
    resourceName="smsInvites"
    title={I18n.t('administration.sms_invites.form_modal.title')}
    requestScope="campaigns"
    resourceBaseUrl={`/administration/new_campaigns/${campaignId}/sms_invites`}
    resource={smsInvite}
    showSuccessMessages
    close={close}
    scrollToFirstError
    modalProps={{ width: 620 }}
  >
    {() => (
      <>
        <Form.Item name="firstName" required label={I18n.t('administration.sms_invites.form_modal.first_name')}>
          <Input />
        </Form.Item>

        <Form.Item name="lastName" required label={I18n.t('administration.sms_invites.form_modal.last_name')}>
          <Input />
        </Form.Item>

        <Form.Item name="mobileNo" required label={I18n.t('administration.sms_invites.form_modal.mobile_no')}>
          <Input />
        </Form.Item>

        <Form.Item name="locale" label={I18n.t('administration.sms_invites.form_modal.locale')} initialValue="en">
          <Select>
            {availableLocales.map(locale => (
              <Select.Option key={locale} value={locale}>
                {I18n.t(`languages.${locale}`)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </>
    )}
  </ResourceFormModal>
)

export const FormModal = connecter(FormModalComponent)
