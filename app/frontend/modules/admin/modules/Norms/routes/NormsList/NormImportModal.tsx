import React, { useCallback, useState } from 'react'
import {
  Button, Modal, Alert, Form, Input, Select, Spin, message,
} from 'antd'
import Event from 'interfaces/Event'
import { debounce } from 'lodash'
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from 'modules/admin/core/rootReducers'
import { LoadingOutlined, CheckOutlined, CloudDownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import { useResources } from '~/hooks/useResources'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { Norm } from '~/modules/admin/modules/client/core/norms'
import { useResourceContext } from '~/modules/admin/components/Resource'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
)

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
    close(): void
}

type Props = PropsFromRedux & OwnProps

export const NormImportModalComponent: React.FC<Props> = ({ close, currentUser }) => {
  const [form] = Form.useForm()
  const [file, setFile] = useState<File | null>(null)
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)
  const { resource } = useResourceContext<Norm>()

  const { data: clients, fetch: fetchClients, isLoading: isClientsLoading } = useResources<Client>('clients')

  const debouncedFetchClients = useCallback(
    debounce((value) => {
      fetchClients({
        apiConfig: { filter: { filterable_fields: value }, fields: { clients: ['name'] } },
      })
    }, 300),
    [],
  )

  const handleImport = (data:FormData, successCallback:()=>void, failureCallback:(error)=>void) => {
    const action = 'norms/import'

    resource.uploadFileAction(action, data).then(() => {
      successCallback()
      message.info(I18n.t('admin.norms_import_success_msg'))
    })
      .catch((error) => {
        message.error(I18n.t('admin.common_import_failure_msg'))
        failureCallback(error)
      })
  }

  const handleUpload = () => {
    if (!file) {
      message.error(I18n.t('admin.norms_import_select_file_validation'))
      return
    }
    const data = new FormData()
    data.append('file', file)
    if (ownerId) {
      data.append('owner_id', ownerId)
    }
    setLoading(true)
    handleImport(data, () => {
      form.resetFields()
      close()
      setLoading(false)
    }, (error) => {
      setErrors(error)
      setLoading(false)
    })
  }

  return (
    <Modal
      width={700}
      title={I18n.t('admin.norms_import_title')}
      open
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>
          {I18n.t('shared.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={!file}
          onClick={() => form.submit()}
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {' '}
          {I18n.t('common.actions.update')}
        </Button>,
      ]}
    >
      <div className="mbl" style={{ fontSize: '16px' }}>
        <a href="/example_csv/import_norm_sample_file.csv">
          <CloudDownloadOutlined />
          <span className="mls">
            {I18n.t('admin.norms_import_download_example_csv')}
          </span>
        </a>
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
        <Form.Item name="importData">
          <Input
            type="file"
            accept=".csv"
            onChange={({ target: { files } }: Event<HTMLInputElement>) => setFile(files && files[0])}
          />
        </Form.Item>
        <Form.Item
          name="ownerId"
          label={I18n.t('shared.owner')}
          initialValue={null}
        >
          <Select
            showSearch={{ filterOption: false, onSearch: debouncedFetchClients }}
            onChange={value => setOwnerId(value)}
            notFoundContent={isClientsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
            placeholder="Select an Owner"
          >
            {isSuperAdmin(currentUser) && <Select.Option>{I18n.t('admin.tte')}</Select.Option>}
            {clients.map(({ id, name }) => (
              <Select.Option key={id} value={id}>{name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export const NormImportModal = connector(NormImportModalComponent)
