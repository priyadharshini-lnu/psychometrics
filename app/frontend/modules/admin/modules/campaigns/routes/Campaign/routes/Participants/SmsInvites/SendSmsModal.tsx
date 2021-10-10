import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  STATUSES, SEARCH, search,
} from 'modules/admin/modules/campaigns/core/smsInvites'
import { isRequestInProgress } from 'modules/admin/core/request'
import {
  Form, Input, DatePicker, Select, Spin,
} from 'antd'
import { availableLocales } from 'core/config'
import { RootState } from 'modules/admin/core/rootReducers'
import debounce from 'lodash/debounce'
import ResourceFormModal from 'components/ResourceFormModal'
import { SafeHTML } from 'components/SafeHTML'

const connecter = connect(
  (state: RootState) => ({
    searching: isRequestInProgress(state, SEARCH),
    availableLocales: availableLocales(state),
  }),
  {
    search,
  },
)
export type PropsFromRedux = ConnectedProps<typeof connecter>

interface OwnProps extends PropsFromRedux {
  campaignId: number
  close(): void
}

type Props = PropsFromRedux & OwnProps

const { I18n } = window
const { Option } = Select

const SendSmsModalComponent: React.FC<Props> = ({
  campaignId,
  close,
  availableLocales,
  searching,
  search,
}) => {
  const [options, setOptions] = React.useState<{ label: string, value: number }[]>([])

  const handleSearchUsers = debounce((searchText: string) => {
    search(campaignId, searchText).then(({ response }) => {
      const options = response.map(invitedUser => ({
        label: invitedUser.fullName,
        value: invitedUser.id,
      }))
      setOptions(options)
    })
  }, 500)

  const transformValues = values => ({
    ...values,
    linkExpiry: values.linkExpiry?.format(),
  })

  return (
    <ResourceFormModal
      resourceName="sms_records"
      title={I18n.t('administration.sms_invites.send_sms.modal.title')}
      requestScope="campaigns"
      resourceBaseUrl={`/administration/new_campaigns/${campaignId}/sms_records`}
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 620 }}
      submitButtonName={I18n.t('administration.sms_invites.send_sms.modal.btn_name')}
      transformValues={transformValues}
    >
      {() => (
        <>
          <Form.Item name={['filters', 'localeIn']} label={I18n.t('administration.sms_invites.send_sms.fields.locale')}>
            <Select mode="multiple">
              {availableLocales.map(locale => (
                <Select.Option key={locale} value={locale}>
                  {I18n.t(`languages.${locale}`)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name={['filters', 'statusIn']}
            initialValue={['not_invited']}
            label={I18n.t('administration.sms_invites.send_sms.fields.statuses')}
          >
            <Select mode="multiple">
              {STATUSES.map(status => (
                <Option value={status} key={status}>
                  {I18n.t(`administration.sms_invites.statuses.${status}`)}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name={['filters', 'idIn']} label={I18n.t('administration.sms_invites.send_sms.fields.users')}>
            <Select
              mode="multiple"
              filterOption={false}
              onSearch={handleSearchUsers}
              notFoundContent={searching ? <Spin size="small" /> : null}
              options={options}
            />
          </Form.Item>
          <Form.Item name="linkExpiry" label={I18n.t('administration.sms_invites.send_sms.fields.link_expiry')}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>
          <Form.Item name="message" label={I18n.t('administration.sms_invites.send_sms.fields.message')}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <SafeHTML html={I18n.lookup('administration.sms_invites.send_sms.pipetext_details')} />
        </>
      )}
    </ResourceFormModal>
  )
}

export const SendSmsModal = connecter(SendSmsModalComponent)
