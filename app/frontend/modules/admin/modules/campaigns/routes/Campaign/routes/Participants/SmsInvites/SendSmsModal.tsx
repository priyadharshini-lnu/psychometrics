import React, { useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Form, Input, DatePicker, Select, Spin,
} from 'antd'
import debounce from 'lodash/debounce'
import { SegmentedMessage } from 'sms-segments-calculator'
import forEach from 'lodash/forEach'
import { InfoCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { SafeHTML } from '~/components/SafeHTML'
import ResourceFormModal from '~/components/ResourceFormModal'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  STATUSES, SEARCH, search, get as getSmsInvites,
} from '~/modules/admin/modules/campaigns/core/smsInvites'
import styles from './SendSmsModal.less'
import { availableLocales } from '~/core/config'
import { isRequestInProgress } from '~/core/request'

const connecter = connect(
  (state: RootState) => ({
    searching: isRequestInProgress(state, SEARCH),
    availableLocales: availableLocales(state),
    inviteUrlLength: getSmsInvites(state).inviteUrlLength,
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
  inviteUrlLength,
}) => {
  const [form] = Form.useForm()
  const [options, setOptions] = useState<{ label: string, value: number }[]>([])
  const [minSegmentLength, setMinSegmentLength] = useState<number>(1)
  const [maxSegmentLength, setMaxSegmentLength] = useState<number>(1)

  const dummyPipeTextReplacement = {
    first_name: '*'.repeat(10), last_name: '*'.repeat(10), invite_url: '*'.repeat(inviteUrlLength),
  }

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

  const caculateAndSetSegmentLength = (text: string) => {
    let minTextWithReplacedPipeText = text
    forEach(
      dummyPipeTextReplacement,
      (value, key) => { minTextWithReplacedPipeText = text.replace(`{{{${key}}}}`, value) },
    )
    const maxTextWithReplacedPipeText = minTextWithReplacedPipeText.concat('*'.repeat(20))
    const minSegmentsCount = new SegmentedMessage(minTextWithReplacedPipeText).segmentsCount
    const maxSegmentsCount = new SegmentedMessage(maxTextWithReplacedPipeText).segmentsCount
    setMinSegmentLength(minSegmentsCount)
    setMaxSegmentLength(maxSegmentsCount)
  }

  const segmentLengthMessage = () => {
    if (minSegmentLength !== maxSegmentLength) {
      return I18n.t('admin.sms_invites_send_sms_segment_length_range_msg',
        { min_segment_length: minSegmentLength, max_segment_length: maxSegmentLength })
    }

    return I18n.t('admin.sms_invites_send_sms_segment_length_msg', { segment_length: minSegmentLength })
  }

  return (
    <ResourceFormModal
      resourceName="sms_records"
      title={I18n.t('admin.sms_invites_send_sms_modal_title')}
      requestScope="campaigns"
      resourceBaseUrl={`/administration/new_campaigns/${campaignId}/sms_records`}
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 620 }}
      submitButtonName={I18n.t('admin.sms_invites_send_sms_modal_btn_name')}
      transformValues={transformValues}
      storeManager={{ form }}
      formProps={{
        onValuesChange: (changedValues) => {
          if (changedValues.message) { caculateAndSetSegmentLength(changedValues.message) }
        },
      }}
    >
      {({ form }) => (
        <>
          <Form.Item name={['filters', 'localeIn']} label={I18n.t('admin.sms_invites_send_sms_fields_locale')}>
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
            label={I18n.t('admin.sms_invites_send_sms_fields_statuses')}
          >
            <Select mode="multiple">
              {STATUSES.map(status => (
                <Option value={status} key={status}>
                  {I18n.t(`admin.sms_invites_statuses_${status}`)}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name={['filters', 'idIn']} label={I18n.t('admin.sms_invites_send_sms_fields_users')}>
            <Select
              mode="multiple"
              showSearch={{ filterOption: false, onSearch: handleSearchUsers }}
              notFoundContent={searching ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
              options={options}
            />
          </Form.Item>
          <Form.Item name="linkExpiry" label={I18n.t('admin.sms_invites_send_sms_fields_link_expiry')}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>
          <Form.Item
            name="message"
            label={I18n.t('admin.sms_invites_send_sms_fields_message')}
            className={styles.message}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          {!!form.getFieldValue('message')?.length && (
            <>
              <InfoCircleOutlined />
              {' '}
              {segmentLengthMessage()}
            </>
          )}
          <SafeHTML className="mt-3" html={I18n.lookup('admin.sms_invites_send_sms_pipetext_details')} />
        </>
      )}
    </ResourceFormModal>
  )
}

export const SendSmsModal = connecter(SendSmsModalComponent)
