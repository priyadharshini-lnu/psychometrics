import React, { useCallback, useState } from 'react'
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons'
import {
  Button, Modal, Alert, Form, Input, Select, Spin, message,
} from 'antd'
import Event from 'interfaces/Event'
import { connect, ConnectedProps } from 'react-redux'
import { debounce } from 'lodash'
import DownloadSampleFile from '~/modules/admin/components/DownloadSampleFile'
import { useResources } from '~/hooks/useResources'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { importNorms } from '~/modules/admin/modules/Norms/core/norms'

const CSVData = `Norm 1,Dimension 1,Factors,Very Low,,Low,,Average,,High,,Very High,
,,Factor 1,0.1,1,1.1,2,2.1,3,3.1,4,4.1,5`

const { I18n } = window

const connecter = connect(() => ({}), { importNorms })
export type PropsFromRedux = ConnectedProps<typeof connecter>

interface OwnProps extends PropsFromRedux {
    close(): void
}

export const ImportModalComponent: React.FC<OwnProps> = ({ close, importNorms }) => {
  const [form] = Form.useForm()
  const [file, setFile] = useState<File | null>(null)
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)

  const { data: clients, fetch: fetchClients, isLoading: isClientsLoading } = useResources<Client>('clients')

  const debouncedFetchClients = useCallback(
    debounce((value) => {
      fetchClients({
        apiConfig: { filter: { filterable_fields: value }, fields: { clients: ['name'] } },
      })
    }, 300),
    [],
  )

  const handleUpload = () => {
    if (!file || !ownerId) {
      message.error(I18n.t('administration.norms.import.select_file_validation'))
      return
    }

    const data = new FormData()
    data.append('file', file)
    data.append('owner_id', ownerId)
    setLoading(true)
    importNorms(data)
      .then(() => {
        message.info(I18n.t('administration.norms.import.success_msg'))
        close()
        form.resetFields()
      }).catch(setErrors).finally(() => {
        setLoading(false)
      })
  }

  return (
    <Modal
      width={700}
      title={I18n.t('administration.norms.import.title')}
      open
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>
          {I18n.t('common.actions.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={!file || !ownerId}
          onClick={() => form.submit()}
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {' '}
          {I18n.t('common.actions.update')}
        </Button>,
      ]}
    >
      <div className="mbl" style={{ fontSize: '16px' }}>
        <DownloadSampleFile
          fileData={CSVData}
          buttonText={I18n.t('administration.norms.import.download_example_csv')}
        />
      </div>
      {errors.length > 0 && (
        <Alert
          message={false}
          description={errors.map((e, i) => <div key={i}>{e}</div>)}
          type="error"
          className="mbm"
        />
      )}
      <Form layout="vertical" form={form} onFinish={handleUpload}>
        <Form.Item name="ownerId" label={I18n.t('common.column.owner')}>
          <Select
            showSearch
            onSearch={debouncedFetchClients}
            onChange={value => setOwnerId(value)}
            notFoundContent={isClientsLoading('fetch') ? <Spin size="small" /> : null}
            filterOption={false}
            placeholder="Select an Owner"
          >
            {clients.map(({ id, name }) => (
              <Select.Option key={id} value={id}>{name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
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

export const NormImportModal = connecter(ImportModalComponent)
