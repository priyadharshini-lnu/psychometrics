import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Form, Input, Select } from 'antd'
import { RootState } from '~/modules/admin/core/rootReducers'
import ResourceFormModal from '~/components/ResourceFormModal'
import { SmsInvite } from '~/modules/admin/modules/campaigns/core/smsInvites'
import { availableLocales } from '~/core/config'

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
    title={I18n.t('admin.sms_invites_form_modal_title')}
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
        <Form.Item name="firstName" required label={I18n.t('shared.first_name')}>
          <Input name="sms_invite_firstname" />
        </Form.Item>

        <Form.Item name="lastName" required label={I18n.t('shared.last_name')}>
          <Input name="sms_invite_lastname" />
        </Form.Item>

        <Form.Item name="mobileNo" required label={I18n.t('admin.sms_invites_form_modal_mobile_no')}>
          <Input name="sms_invite_mobile" />
        </Form.Item>

        <Form.Item name="locale" label={I18n.t('admin.sms_invites_form_modal_locale')} initialValue="en">
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
