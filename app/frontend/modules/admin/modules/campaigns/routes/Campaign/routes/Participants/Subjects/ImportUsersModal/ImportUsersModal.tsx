import React, { useState } from 'react'
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons'
import {
  Button, Modal, message, Alert, Form, Radio, Input,
} from 'antd'
import Event from 'interfaces/Event'
import _ from 'lodash'
import { PropsFromRedux } from './connect'

const { I18n } = window

const operationsOptions = ['skip_existing', 'add_with_existing_response', 'add_and_allow_new_response']

interface OwnProps {
  campaignId: number
  close(): void
}

const ImportUserModal: React.FC<OwnProps & PropsFromRedux> = ({
  campaignId,
  close,
  importUsers,
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
    importUsers(campaignId, data)
      .then(() => {
        message.info(I18n.t('user.modals.import.success_msg'))
        close()
      })
      .catch(setErrors)
  }

  const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
  }

  return (
    <Modal
      width={700}
      title={I18n.t('user.modals.import.title')}
      open
      onCancel={close}
      footer={[
        <Button
          key="back"
          onClick={close}
        >
          {I18n.t('common.actions.cancel')}
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
      <p>{I18n.t('user.modals.import.body')}</p>
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
        initialValues={{ operation: operationsOptions[0] }}
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
        <Form.Item name="operation">
          <Radio.Group>
            {operationsOptions.map(option => (
              <Radio style={radioStyle} value={option} key={option}>
                {I18n.t(`user.form.operation_options.${option}`)}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  )
}


export default ImportUserModal
