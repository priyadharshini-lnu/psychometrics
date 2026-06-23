import { FC } from 'react'
import {
  Drawer, Row, Descriptions,
} from 'antd'

import {
  SmsHistory,
} from '~/modules/admin/modules/campaigns/core/smsHistories'

const { I18n } = window

interface Props {
  close: () => void
  smsHistory: SmsHistory | undefined
}

export const DetailsDrawer: FC<Props> = ({
  close,
  smsHistory,
}) => {
  if (!smsHistory) {
    return null
  }

  const { smsRecord } = smsHistory

  return (
    <Drawer
      title={I18n.t('admin.sms_histories_drawer_title')}
      placement="right"
      closable
      onClose={close}
      open
      width="40%"
    >
      <Row>
        <Descriptions
          layout="horizontal"
          className="mb-6 w-100"
          bordered
          column={1}
        >
          <Descriptions.Item
            label={I18n.t('shared.id')}
            key="id"
            className="va-t w-30"
            labelStyle={{ width: '40%' }}
            contentStyle={{ width: '60%' }}
          >
            {smsRecord.id}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('admin.sms_records_columns_message')}
            key="message"
            className="va-t w-30"
          >
            {smsRecord.message}
          </Descriptions.Item>
        </Descriptions>
      </Row>
    </Drawer>
  )
}
