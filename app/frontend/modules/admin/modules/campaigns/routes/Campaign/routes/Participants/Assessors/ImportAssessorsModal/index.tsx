import React, { useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'


import {
  Button, Modal, message, Alert, Form, Input,
} from 'antd'
import Event from 'interfaces/Event'
import _ from 'lodash'
import { LoadingOutlined, CheckOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { importAssessors, IMPORT } from '~/modules/admin/modules/campaigns/core/assessors'
import { RootState } from '~/modules/admin/core/rootReducers'
import { isRequestInProgress } from '~/core/request'

const connecter = connect(
  (state: RootState) => ({
    loading: isRequestInProgress(state, IMPORT),
  }),
  {
    importAssessors,
  },
)
export type PropsFromRedux = ConnectedProps<typeof connecter>

const { I18n } = window

interface OwnProps extends PropsFromRedux {
  campaignId: number
  close(): void
}

const ImportAssessorsModal: React.FC<OwnProps> = ({
  campaignId,
  close,
  importAssessors,
  loading,
}) => {
  const [form] = Form.useForm()
  const [file, setFile] = useState<File | null>(null)
  const [, setFields] = useState({})

  const [errors, setErrors] = useState([])

  const handleUpdate = (params) => {
    const data = new FormData()
    if (!file) return

    _.map(params, (value, key) => {
      data.append(key, value)
    })
    data.append('import_data', file)
    importAssessors(campaignId, data)
      .then(() => {
        message.info(I18n.t('user.modals.import.success_msg'))
        close()
      })
      .catch(setErrors)
  }

  return (
    <Modal
      width={700}
      title={I18n.t('admin.assessor_modals_import_title')}
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
          disabled={!form.getFieldValue('importData')}
          onClick={() => {
            form.submit()
          }
          }
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('frontend.update')}
        </Button>,
      ]}
    >
      <p>{I18n.t('admin.assessor_modals_import_body')}</p>
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
        onFieldsChange={(a, allFields) => {
          setFields(allFields)
        }}
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


export default connecter(ImportAssessorsModal)
