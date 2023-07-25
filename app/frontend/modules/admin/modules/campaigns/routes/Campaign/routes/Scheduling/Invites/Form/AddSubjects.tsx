import { FC, useState, useRef } from 'react'
import {
  Button, Select, Row, Col, Space, List, Dropdown, Spin, Modal, Input, InputRef, FormInstance, Alert,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import {
  CloudDownloadOutlined, SearchOutlined, DownOutlined,
} from '@ant-design/icons'
import _ from 'lodash'
import { useParams } from 'react-router-dom'
import { UserInfoCard } from '~/glint/components/UserInfoCard'
import { Panel } from '~/glint/components/Panel/Panel'
import { User, UserTR } from '~/modules/admin/modules/campaigns/core/user'
import styles from './Form.less'
import { useResources } from '~/hooks/useResources'
import { uploadCSV } from '~/modules/admin/modules/client/core/workshopInvite'

const { I18n } = window
const connecter = connect(() => ({}), { uploadCSV })

type Props = ConnectedProps<typeof connecter> & {
  form: FormInstance,
  next: () => void
  prev: () => void
}

export const AddSubjectsComponent: FC<Props> = ({
  form, next, prev, uploadCSV,
}) => {
  const [uploadModal, showUploadModal] = useState(false)
  const [csvErrors, setCSVErrors] = useState<{index: number, email:string}[]>([])
  const ref = useRef<InputRef>(null)
  const {
    data: users, fetch: fetchUsers, isLoading: isUsersLoading,
  } = useResources<User>('users', { responseType: UserTR })

  const {
    collectionAction,
  } = useResources<User>('workshop_invites')
  const params = useParams<{campaignId: string}>()

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
      action: 'import_subjects_from_campaign',
      method: 'get',
      apiConfig: {
        filter: { campaign_id: params.campaignId },
      },
    }).then((data:User[]) => {
      data.forEach((user) => {
        addSubject(user)
      })
    })
  }

  const upload = () => {
    const files = ref.current?.input?.files
    if (files && files[0]) {
      const fd = new FormData()
      fd.append('campaign_id', params.campaignId)
      fd.append('file', files[0])
      uploadCSV(fd).then(({ response }) => {
        response.data.map((u) => {
          addSubject({ id: u.id, ...u.attributes })
        })
        if (response.meta.errors) {
          setCSVErrors(response.meta.errors)
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
      label: I18n.t('workshop_invite.subjects.upload_csv'),
      key: 'upload_csv',
    },
    {
      label: I18n.t('workshop_invite.subjects.import_from_campaign'),
      key: 'import_all',
    }],
  }

  return (
    <div>
      <Modal
        closable={false}
        open={uploadModal}
        footer={[
          <Button type="primary" onClick={() => upload()}>{I18n.t('workshop_invite.subjects.upload')}</Button>,
          <Button onClick={() => showUploadModal(false)}>{I18n.t('workshop_invite.subjects.cancel')}</Button>,
        ]}
      >
        <Input ref={ref} type="file" />
      </Modal>
      <Panel
        title={I18n.t('workshop_invite.subjects.title')}
        description={I18n.t('workshop_invite.subjects.description')}
      >
        <Row className={styles.controls} justify="space-between">
          <Col>
            <Space>
              {I18n.t('workshop_invite.subjects.count', { count: subjects.length })}
            </Space>
          </Col>
          <Col>
            <Space>
              <Select
                style={{ width: 200 }}
                showSearch
                placeholder={(
                  <Space>
                    <SearchOutlined />
                    {I18n.t('workshop_invite.subjects.search_user')}
                  </Space>
                )}
                onSearch={(value) => {
                  fetchUsers({
                    apiConfig: {
                      filter: {
                        search_query: value,
                        with_campaign_user: params.campaignId,
                      },
                    },
                  })
                }}
                onSelect={selectUser}
                notFoundContent={isUsersLoading('fetch') ? <Spin size="small" /> : null}
                filterOption={false}
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
                  {I18n.t('workshop_invite.subjects.import_users')}
                  <DownOutlined />
                </Button>
              </Dropdown>
            </Space>
          </Col>
        </Row>
        {csvErrors.length > 0 && (
          <Row className={styles.errors}>
            <Col flex="1">
              <Alert
                message="Errors"
                description={csvErrors.map(error => I18n.t('workshop_invite.subjects.csv_error', error))}
                type="error"
              />
            </Col>
          </Row>
        )}
        <List
          grid={{
            xs: 1, sm: 2, md: 4, lg: 4, xl: 4, xxl: 4, gutter: 16,
          }}
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
          <Button onClick={prev}>{I18n.t('workshop_invite.back')}</Button>
          <Button type="primary" onClick={next}>{I18n.t('workshop_invite.next')}</Button>
        </Space>
      </div>
    </div>
  )
}

export const AddSubjects = connecter(AddSubjectsComponent)
