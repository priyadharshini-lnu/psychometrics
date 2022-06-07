import React, { useState } from 'react'
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons'
import {
  Button, Modal, message, Alert, Form, Radio, Input,
} from 'antd'
import { Store } from 'antd/lib/form/interface'
import Event from 'interfaces/Event'
import each from 'lodash/each'
import { connect, ConnectedProps } from 'react-redux'

import { RootState } from 'modules/admin/core/rootReducers'

import { importDatasheet, IMPORT } from 'modules/admin/modules/DatasheetManagement/core/list'
import { isRequestInProgress } from 'modules/admin/core/request'
import { ParentResourceType } from '../../interfaces'
import styles from './styles.less'

const connecter = connect(
  (state: RootState) => ({
    loading: isRequestInProgress(state, IMPORT),
  }),
  {
    importDatasheet,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>


const { I18n } = window

const OPERATIONS_OPTIONS = ['replace_existing', 'merge_with_existing']

interface OwnProps {
  parentType: ParentResourceType
  parentId: number
  close(): void
}
type Props = OwnProps & PropsFromRedux

const ImportDatasheetModal: React.FC<Props> = ({
  parentType,
  parentId,
  close,
  importDatasheet,
  loading,
}) => {
  const [form] = Form.useForm()
  const [file, setFile] = useState<File | null>(null)
  const [, setFields] = useState({})

  const [errors, setErrors] = useState([])

  const handleUpdate = (params: Store) => {
    const data = new FormData()
    if (!file) return

    each(params, (value, key) => {
      data.append(key, value)
    })
    data.append('file', file)
    importDatasheet(parentType, parentId, data)
      .then(() => {
        message.info(I18n.t('datasheet.import_modal.success_message'))
        close()
      })
      .catch(setErrors)
  }

  return (
    <Modal
      width={700}
      title={I18n.t('datasheet.import_modal.title')}
      visible
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
        initialValues={{ operation: OPERATIONS_OPTIONS[0] }}
        onFieldsChange={(a, allFields) => {
          setFields(allFields)
        }}
      >
        <Form.Item name="importData">
          <Input
            type="file"
            accept=".xlsx"
            onChange={({ target: { files } }: Event<HTMLInputElement>) => setFile(files && files[0])}
          />
        </Form.Item>
        <Form.Item name="operation">
          <Radio.Group>
            {OPERATIONS_OPTIONS.map(option => (
              <Radio className={styles.radioBtn} value={option} key={option}>
                {I18n.t(`datasheet.import_modal.operations.${option}`)}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  )
}


export default connecter(ImportDatasheetModal)
