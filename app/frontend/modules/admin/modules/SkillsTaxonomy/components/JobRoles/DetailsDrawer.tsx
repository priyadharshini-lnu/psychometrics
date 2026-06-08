import {
  FC, useCallback, useEffect, useMemo, useState,
} from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  App,
  Button,
  Descriptions,
  Drawer, Form, Row, Select, Skeleton, Spin, Table, Typography,
} from 'antd'
import { debounce } from 'lodash'
import { useParams } from 'react-router-dom'
import { useResources } from '~/hooks/useResources'
import { JobRole } from '~/modules/admin/modules/client/core/jobRoles'
import { JobRoleSkillMapping } from '~/modules/admin/modules/client/core/jobRoleSkillMappings'
import { ApiConfig } from '~/hooks/useResources/interfaces'
import {
  CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { Skill } from '~/modules/admin/modules/client/core/skills'

import styles from './styles.less'
import ResourceForm from '~/components/ResourceForm'

const { I18n } = window

const connector = connect(
  () => ({}),
  {},
)

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & {
  jobRole?: JobRole
  onClose: () => void
}

interface ExtendedJobRoleSkillMapping extends JobRoleSkillMapping {
  allowedProficiencyLevels: {
    [key: number]: string
  }
}

const getAllowedProfLevelsForSkill = (allSkills, skillId) => {
  const selectedSkill = allSkills.find(skill => skill.id === skillId)
  return Object.entries(selectedSkill?.allowedProficiencyLevels ?? {}).map(([key, value]) => ({
    label: value, value: Number(key),
  }))
}

const DetailsDrawerComponent: FC<Props> = ({
  jobRole,
  onClose,
}) => {
  const [addMapping, setAddMapping] = useState<boolean>()
  const [editMapping, setEditMapping] = useState<JobRoleSkillMapping>()

  const params = useParams()
  const [form] = Form.useForm()
  const { modal, message } = App.useApp()

  const selectedSkill = Form.useWatch(['skillId'], form)

  const {
    data: jobRoleSkillMappings, fetch: fetchMappings, isLoading: isMappingsLoading,
    createResource, updateResource, removeResource,
  } = useResources<ExtendedJobRoleSkillMapping>('skills_job_roles', {
    apiConfig: {
      include: ['project', 'skill'],
      fields: { skills: ['name'] },
      filter: {
        job_role_id_eq: jobRole?.id,
      },
      ...(jobRole?.project?.id ? { project_id: jobRole?.project?.id } : {}),
    } as ApiConfig,
  })

  const {
    data: skills,
    fetch: fetchSkills, isLoading: isSkillsLoading,
  } = useResources<Skill>('skills', {
    apiConfig: {
      filter: {
        ...(params?.projectId ? { project_id_eq: params?.projectId } : {}),
      },
    },
  })

  const add = () => {
    form.setFieldsValue({ skillId: '', expectedProficiencyLevel: '' })
    setAddMapping(true)
    setEditMapping(undefined)
  }

  const edit = (record) => {
    form.setFieldsValue({ skillId: '', expectedProficiencyLevel: '', ...record })
    setEditMapping(record)
    setAddMapping(false)
  }

  const cancel = () => {
    setEditMapping(undefined)
    setAddMapping(false)
  }

  const deleteMapping = (record) => {
    modal.confirm({
      title: I18n.t('shared.delete'),
      content: I18n.t('admin.job_role_are_you_sure_to_remove'),
      okText: I18n.t('shared.ok'),
      cancelText: I18n.t('shared.cancel'),
      onOk: async () => {
        removeResource(record.id).then(() => {
          message.success('Success')
        }).catch(() => {
          message.error('Error')
        })
      },
    })
  }

  const close = () => {
    cancel()
    onClose()
  }

  const mappings = useMemo(() => {
    const finalMappings = [...jobRoleSkillMappings]
    if (addMapping) {
      finalMappings.push({} as ExtendedJobRoleSkillMapping)
    }
    return finalMappings
  }, [jobRoleSkillMappings, addMapping])

  const getSkills = (): Skill[] => {
    if (!skills?.length && jobRoleSkillMappings[0]?.skill) {
      return [jobRoleSkillMappings[0].skill]
    }
    const set = new Set(jobRoleSkillMappings?.map(item => String(item.skillId)))
    return skills?.filter(skill => !set.has(skill.id))
  }

  const debouncedFetchSkills = useCallback(debounce((value) => {
    fetchSkills({
      apiConfig: {
        filter: {
          name_cont: value,
          ...((jobRole?.project?.id || params.projectId)
            ? { project_id_eq: jobRole?.project?.id || params.projectId }
            : {}
          ),
        },
      },
    })
  }, 300), [])

  useEffect(() => {
    if (jobRole?.id) {
      fetchMappings()
    }
    fetchSkills()
  }, [jobRole?.id])

  const transformValues = values => ({
    ...values,
    project_id: (params.projectId || jobRole?.project?.id) ? Number(params.projectId || jobRole?.project?.id) : null,
    job_role_id: Number(jobRole?.id),
    skill_id: Number(values.skillId || editMapping?.skillId),
    expected_proficiency_level: (values.expectedProficiencyLevel === null || values.expectedProficiencyLevel === '')
      ? null
      : Number(values.expectedProficiencyLevel),
  })

  return (
    <Drawer
      title={I18n.t('admin.job_role_job_role_details')}
      onClose={close}
      placement="right"
      maskClosable
      closable
      open={!!jobRole}
      destroyOnHidden
      width="50%"
    >
      <Row>
        <Descriptions
          layout="horizontal"
          rootClassName="mb-6 w-100"
          bordered
          column={1}
        >
          <Descriptions.Item
            label={I18n.t('shared.id')}
            key="description"
            className="va-t w-30"
            labelStyle={{ width: '30%' }}
            contentStyle={{ width: '70%' }}
          >
            {jobRole?.id}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('shared.name')}
            key="description"
            className="va-t w-30"
            labelStyle={{ width: '30%' }}
            contentStyle={{ width: '70%' }}
          >
            {jobRole?.name}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('shared.code')}
            key="description"
            className="va-t w-30"
            labelStyle={{ width: '30%' }}
            contentStyle={{ width: '70%' }}
          >
            {jobRole?.code}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('shared.description')}
            key="description"
            className="va-t w-30"
            labelStyle={{ width: '30%' }}
            contentStyle={{ width: '70%' }}
          >
            {jobRole?.description}
          </Descriptions.Item>
        </Descriptions>
        <Typography.Title level={5}>{I18n.t('admin.skills_title')}</Typography.Title>
        <Skeleton loading={isMappingsLoading('fetch')} active>
          <ResourceForm
            resourceName="mapping"
            resource={(editMapping) ? transformValues(editMapping) : undefined}
            readableResourceName={I18n.t('admin.job_role_skill_mapping_form_title')}
            showSuccessMessages
            storeManager={{ form }}
            scrollToFirstError
            request={{
              createResource,
              updateResource,
            }}
            transformValues={transformValues}
            onSuccessfulSubmission={cancel}
            style={{ width: '100%' }}
          >
            {() => (
              <Table
                dataSource={mappings}
                columns={[
                  {
                    title: I18n.t('admin.job_role_column_skill_name'),
                    key: 'skillName',
                    dataIndex: 'skill.name',
                    width: '50%',
                    render: (_, mapping) => (
                      (!mapping.id && addMapping) ? (
                        <Form.Item
                          name="skillId"
                          rules={[{ required: true }]}
                          style={{ marginBottom: 0 }}
                        >
                          <Select
                            showSearch={{ filterOption: false, onSearch: debouncedFetchSkills }}
                            loading={isSkillsLoading('fetch')}
                            notFoundContent={
                              isSkillsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')
                            }
                            options={getSkills().map(p => ({
                              value: p.id,
                              label: p.name,
                            }))}
                          />
                        </Form.Item>
                      ) : (
                        <Typography.Text>{mapping.skill?.name}</Typography.Text>
                      )
                    ),
                  },
                  {
                    title: I18n.t('admin.job_role_skill_mapping_column_expected_proficiency_level'),
                    key: 'expectedProficiencyLevel',
                    dataIndex: 'expectedProficiencyLevel',
                    width: '100%',
                    render: (_, mapping) => (
                      (editMapping?.id === mapping.id || (!mapping.id && addMapping)) ? (
                        <Form.Item
                          name="expectedProficiencyLevel"
                          style={{ marginBottom: 0 }}
                        >
                          <Select
                            style={{ width: '100%' }}
                          >
                            <Select.Option key="not-applicable" value={null}>
                              {I18n.t('shared.na_text')}
                            </Select.Option>
                            {
                              getAllowedProfLevelsForSkill(skills, editMapping?.skillId || selectedSkill).map(item => (
                                <Select.Option key={item.value} value={item.value}>
                                  {item.label as string}
                                </Select.Option>
                              ))
                            }
                          </Select>
                        </Form.Item>
                      ) : (
                        <Typography.Text>
                          {(mapping?.expectedProficiencyLevel == null
                            || !mapping?.allowedProficiencyLevels?.[mapping?.expectedProficiencyLevel])
                            ? I18n.t('shared.na_text')
                            : mapping?.allowedProficiencyLevels?.[mapping?.expectedProficiencyLevel]
                          }
                        </Typography.Text>
                      )
                    ),
                  },
                  {
                    title: '',
                    key: 'action',
                    className: styles.actionColCel,
                    render: (_, mapping) => (
                      <div className={styles.actionsWrapper}>
                        {
                          (editMapping?.id === mapping.id || (!mapping.id && addMapping)) ? (
                            <>
                              <Button
                                onClick={() => form.submit()}
                                size="small"
                                loading={isMappingsLoading('add') || isMappingsLoading(`update@${editMapping?.id}`)}
                                disabled={isMappingsLoading('add')}
                              >
                                <CheckOutlined />
                              </Button>
                              <Button onClick={cancel} size="small" disabled={isMappingsLoading('add')}>
                                <CloseOutlined />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button onClick={() => edit(mapping)} size="small">
                                <EditOutlined />
                              </Button>
                              <Button onClick={() => deleteMapping(mapping)} size="small">
                                <DeleteOutlined />
                              </Button>
                            </>
                          )
                        }
                      </div>
                    ),
                  },
                ]}
                pagination={false}
                footer={() => (
                  <Button
                    type="primary"
                    variant="filled"
                    icon={<PlusOutlined />}
                    onClick={add}
                    disabled={addMapping}
                  >
                    Add
                  </Button>
                )}
              />
            )}
          </ResourceForm>
        </Skeleton>
      </Row>
    </Drawer>
  )
}

export const DetailsDrawer = connector(DetailsDrawerComponent)
