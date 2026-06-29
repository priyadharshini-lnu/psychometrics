import React, { useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'


import {
  Button, Modal, message, Alert, Form, Input,
} from 'antd'
import Event from 'interfaces/Event'
import { LoadingOutlined, CheckOutlined, CloudDownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { importSmsInvites, IMPORT } from '~/modules/admin/modules/campaigns/core/smsInvites'
import { RootState } from '~/modules/admin/core/rootReducers'
import { isRequestInProgress } from '~/core/request'

const connecter = connect(
  (state: RootState) => ({
    loading: isRequestInProgress(state, IMPORT),
  }),
  {
    importSmsInvites,
  },
)
export type PropsFromRedux = ConnectedProps<typeof connecter>

const { I18n } = window

interface OwnProps extends PropsFromRedux {
  campaignId: number
  close(): void
}

const ImportModalComponent: React.FC<OwnProps> = ({
  campaignId,
  close,
  importSmsInvites,
  loading,
}) => {
  const [form] = Form.useForm()
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState([])

  const handleUpdate = () => {
    const data = new FormData()
    if (!file) return
    data.append('file', file)

    importSmsInvites(campaignId, data)
      .then(() => {
        message.info(I18n.t('admin.sms_invites_import_success_msg'))
        close()
      })
      .catch(setErrors)
  }

  return (
    <Modal
      width={700}
      title={I18n.t('admin.sms_invites_import_title')}
      open
      onCancel={close}
      footer={[
        <Button
          key="back"
          onClick={close}
        >
          {I18n.t('shared.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={!file}
          onClick={() => {
            form.submit()
          }
          }
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('shared.update')}
        </Button>,
      ]}
    >
      <div className="mbl" style={{ fontSize: '16px' }}>
        <a
          href={`/administration/new_campaigns/${campaignId}/sms_invites/download_example_import_file`}
          target="blank"
        >
          <CloudDownloadOutlined />
          <span className="mls">{I18n.t('admin.sms_invites_import_download_example_csv')}</span>
        </a>
      </div>
      {errors.length ? (
        <Alert
          message={false}
          description={errors.map((e, i) => <div key={i}>{e}</div>)}
          type="error"
          className="mbm"
        />
      ) : null}
      <Form
        name="basic"
        form={form}
        onFinish={handleUpdate}
      >
        <Form.Item name="importData">
          <Input
            type="file"
            accept=".csv"
            onChange={({ target: { files } }: Event<HTMLInputElement>) => setFile(files && files[0])}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}


export const ImportModal = connecter(ImportModalComponent)
