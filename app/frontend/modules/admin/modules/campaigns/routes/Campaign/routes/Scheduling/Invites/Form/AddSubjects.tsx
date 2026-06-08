import {
  FC, useState, useRef,
} from 'react'
import {
  Button, Select, Row, Col, Space, List, Dropdown, Spin, Modal, Input, InputRef, FormInstance, Alert, message,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import _ from 'lodash'
import { useParams } from 'react-router-dom'
import {
  CloudDownloadOutlined, SearchOutlined, DownOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/admin/core/rootReducers'
import { UserInfoCard } from '~/glint/components/UserInfoCard'
import { Panel } from '~/glint/components/Panel/Panel'
import { User, UserTR } from '~/modules/admin/modules/campaigns/core/user'
import styles from './Form.less'
import { useResources } from '~/hooks/useResources'
import { uploadCSV, UPLOAD_CSV } from '~/modules/admin/modules/client/core/workshopInvite'
import { isRequestInProgress } from '~/core/request'

const BULK_IMPORT_ACTION = 'import_subjects_from_campaign'
const { I18n } = window
const connecter = connect((state: RootState) => ({
  uploadInProgress: isRequestInProgress(state, UPLOAD_CSV),
}), { uploadCSV })

type Props = ConnectedProps<typeof connecter> & {
  form: FormInstance,
  next: () => Promise<void> | void
  prev?: () => void
  onCancel?: () => void
  errors?: Array<string> | null
}

export const AddSubjectsComponent: FC<Props> = ({
  form, next, prev, uploadCSV, uploadInProgress, onCancel, errors,
}) => {
  const [uploadModal, showUploadModal] = useState(false)
  const [importErrors, setImportErrors] = useState<{title: string}[]>([])
  const [csvErrors, setCSVErrors] = useState<{index: number, email:string}[]>([])
  const ref = useRef<InputRef>(null)
  const { campaignId } = useParams() as { campaignId: string }
  const {
    data: users, fetch: fetchUsers, isLoading: isUsersLoading,
  } = useResources<User>('users', { basePath: `campaigns/${campaignId}`, responseType: UserTR })

  const {
    collectionAction, isLoading: isCollectionActionLoading,
  } = useResources<User>('workshop_invites', { basePath: `campaigns/${campaignId}` })

  const [subjects, setSubjects] = useState<User[]>(form.getFieldValue('subjects') || [])

  const addSubject = (user) => {
    if (_.find(subjects, { id: user.id })) { return }
    form.setFieldValue('subjects', [...(form.getFieldValue('subjects') || []), user])
    setSubjects(form.getFieldValue('subjects'))
  }

  const removeSubject = (id) => {
    form.setFieldValue('subjects', form.getFieldValue('subjects').filter(u => u.id !== id))
    setSubjects(form.getFieldValue('subjects'))
  }

  const selectUser = (id) => {
    const user = _.find(users, { id })
    addSubject(user)
  }

  const fetchCampaignUsers = () => {
    collectionAction({
      action: BULK_IMPORT_ACTION,
      method: 'get',
      body: { page: { size: 300 } },
    }).then((data:User[]) => {
      setImportErrors([])
      data.forEach((user) => {
        addSubject(user)
      })
    }).catch((errors) => {
      setImportErrors(errors.base)
    })
  }

  const upload = () => {
    const files = ref.current?.input?.files
    if (files && files[0]) {
      const fd = new FormData()
      fd.append('page[size]', '300')
      fd.append('file', files[0])
      uploadCSV(campaignId, fd).then(({ response }) => {
        response.data.map((u) => {
          addSubject({ id: u.id, ...u.attributes })
        })
        if (response.meta.errors) {
          setCSVErrors(response.meta.errors)
        } else {
          message.success(I18n.t('admin.invite_subjects_csv_imported',
            { count: response.data.length }))
        }
        showUploadModal(false)
      })
      setCSVErrors([])
    }
  }

  const importMenu = {
    onClick ({ key }) {
      if (key === 'import_all') {
        fetchCampaignUsers()
      }
      if (key === 'upload_csv') {
        showUploadModal(true)
      }
    },
    items: [{
      label: I18n.t('admin.invite_subjects_upload_csv'),
      key: 'upload_csv',
    },
    {
      label: I18n.t('admin.invite_subjects_import_from_campaign'),
      key: 'import_all',
    }],
  }

  const handleCancel = () => {
    onCancel?.()
  }

  return (
    <div>
      <Modal
        closable={false}
        open={uploadModal}
        title={I18n.t('admin.invite_subjects_import_title')}
        footer={[
          <Button type="primary" disabled={uploadInProgress} onClick={() => upload()}>
            {I18n.t('shared.upload')}
          </Button>,
          <Button onClick={() => showUploadModal(false)}>
            {I18n.t('shared.cancel')}
          </Button>,
        ]}
      >
        <Space orientation="vertical">
          <div>
            <Space>
              {I18n.t('admin.invite_subjects_file_example')}
              <a
                href="/example_csv/workshop_subject_import.csv"
                target="_blank"
              >
                {I18n.t('shared.download')}
              </a>
            </Space>
          </div>
          <Input ref={ref} type="file" accept=".csv" />
        </Space>
      </Modal>
      <Panel
        title={I18n.t('admin.invite_subjects_title')}
        description={I18n.t('admin.invite_subjects_description')}
      >
        <Row className={styles.controls} justify="space-between">
          <Col>
            <Space>
              {I18n.t('admin.invite_subjects_count', { count: subjects.length })}
            </Space>
          </Col>
          <Col>
            <Space>
              <Select
                style={{ width: 200 }}
                showSearch={{
                  filterOption: false,
                  onSearch: (value) => {
                    fetchUsers({
                      apiConfig: {
                        filter: {
                          search_query: value,
                        },
                      },
                    })
                  },
                }}
                value={null}
                placeholder={(
                  <Space>
                    <SearchOutlined />
                    {I18n.t('admin.invite_subjects_search_user')}
                  </Space>
                )}
                onSelect={selectUser}
                notFoundContent={isUsersLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
              >
                {users.map(({ id, name, email }) => (
                  <Select.Option key={id} value={id}>
                    {name}
                    {' '}
                    (
                    {email}
                    )
                  </Select.Option>
                ))}
              </Select>
              <Dropdown menu={importMenu}>
                <Button type="primary">
                  <CloudDownloadOutlined />
                  {I18n.t('admin.invite_subjects_import_users')}
                  <DownOutlined />
                </Button>
              </Dropdown>
            </Space>
          </Col>
        </Row>
        {importErrors.length > 0 && (
          <Row className={styles.errors}>
            <Col flex="1">
              <Alert
                message="Errors"
                description={(
                  <>
                    {importErrors.map(
                      error => error.title,
                    )}
                  </>
                )}
                type="error"
              />
            </Col>
          </Row>
        )}
        {csvErrors.length > 0 && (
          <Row className={styles.errors}>
            <Col flex="1">
              <Alert
                message="Errors"
                description={csvErrors.map(
                  error => <div>{I18n.t('admin.invite_subjects_csv_error', error)}</div>,
                )}
                type="error"
              />
            </Col>
          </Row>
        )}
        {errors && errors.length > 0 && (
          <Row className={styles.errors}>
            <Col flex="1">
              <Alert
                message="Subject Validation Errors"
                description={errors.map(
                  (error, index) => <div key={index}>{error}</div>,
                )}
                type="error"
              />
            </Col>
          </Row>
        )}
        <List
          grid={{
            xs: 1, sm: 2, md: 4, lg: 4, xl: 4, xxl: 4, gutter: 16,
          }}
          loading={isCollectionActionLoading(`get/${BULK_IMPORT_ACTION}`)}
          dataSource={subjects}
          renderItem={item => (
            <List.Item key={item.id}>
              <UserInfoCard
                id={item.id}
                nameLabel={item.name}
                nameText={item.name}
                email={item.email}
                onRemove={() => removeSubject(item.id)}
              />
            </List.Item>
          )}
        />
      </Panel>
      <div className={styles.footer}>
        <Space>
          {
            onCancel && (
              <Button onClick={handleCancel}>
                {I18n.t('shared.cancel')}
              </Button>
            )
          }
          {prev ? <Button onClick={prev}>{I18n.t('shared.back')}</Button> : null}
          <Button type="primary" onClick={next}>
            {I18n.t('shared.next')}
          </Button>
        </Space>
      </div>
    </div>
  )
}

export const AddSubjects = connecter(AddSubjectsComponent)
