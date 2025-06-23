import React, { useCallback, useEffect, useState } from 'react'
import {
  Form, Input, Select, Spin, Switch, Table,
} from 'antd'
import { useParams } from 'react-router-dom'
import { debounce } from 'lodash'
import { Skill } from '~/modules/admin/modules/client/core/skills'
import { useResources } from '~/hooks/useResources'
import { useResourceContext } from '~/modules/admin/components/Resource'
import ResourceFormModal from '~/components/ResourceFormModal'
import { convertEnumToObject } from '~/utils/object'
import { ProficiencyLevel } from '~/modules/admin/modules/client/core/proficiencyLevels'
import { SkillTypeEnum } from '../../constants'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { Project } from '~/modules/admin/modules/client/core/projects'

import styles from './styles.less'
import { ProficiencyTypesEnum } from './constants'

type OptionsType = {
  id: string
  name: string
}

type Props = {
  close(): void
  proficiencyLevel: ProficiencyLevel
}

const { I18n } = window

export const ProficiencyModal: React.FC<Props> = ({ close, proficiencyLevel }) => {
  const params = useParams()

  const { resource } = useResourceContext<ProficiencyLevel>()
  const [form] = Form.useForm()
  const {
    data: owners, fetch: fetchOwners, isLoading: isOwnerLoading,
  } = useResources<Client>('clients')

  const [selectedLevel, setSelectedLevel] = useState<number>(proficiencyLevel?.level ?? 0)
  const [levelDefinitions, setLevelDefinitions] = useState<{
    level: number
    name: string
    description: string
  }[]>([])

  const ownersLoading = isOwnerLoading('fetch')

  const global = Form.useWatch('global', form)

  const fetchOwnersByValue = (value: string) => fetchOwners({
    apiConfig: {
      filter: {
        filterable_fields: value,
      },
    },
  })

  const searchAvailableOwners = debounce((value) => {
    fetchOwnersByValue(value)
  }, 300)

  const {
    data: skills, fetch: fetchSkills, isLoading: isSkillsLoading,
  } = useResources('skills', {
    apiConfig: {
      filter: {
        project_id_eq: params.projectId || '',
      },
    },
  })

  useEffect(() => {
    form.resetFields(['ownerId'])
  }, [global])

  const ownerId = Form.useWatch(['ownerId'], form)
  const getProjects = (): OptionsType[] => {
    if (!proficiencyLevel || !proficiencyLevel.project) {
      return projects
    }

    return [...projects, proficiencyLevel.project] as OptionsType[]
  }

  const {
    data: projects, fetch: fetchProjects, isLoading: projectIsLoading, setData: setProjects,
  } = useResources<Project>('projects', { basePath: `clients/${ownerId}` })

  useEffect(() => {
    setProjects([])
    form.resetFields(['projectId'])
  }, [ownerId])

  const handleProjectSearch = debounce((value) => {
    fetchProjects({
      apiConfig: {
        filter: { filterable_fields: value },
        fields: { clients: ['name'] },
      },
    })
  }, 300)

  const validateUniqueLevel = (_, value) => {
    const list = form.getFieldValue('levelDefinition') || []
    const duplicate = list.filter(item => String(item.level) === String(value))
    if (duplicate.length > 1) {
      return Promise.reject(new Error(I18n.t('administration.proficiency_levels.errors.create.must_be_unique')))
    }
    return Promise.resolve()
  }

  const columns = [
    {
      title: I18n.t('administration.proficiency_levels.fields.level'),
      dataIndex: 'level',
      width: 100,
      render: (_: unknown, record, index: number) => (
        <Form.Item
          name={['levelDefinition', index, 'level']}
          rules={[
            { required: true },
            {
              validator: (_, value) => validateUniqueLevel(_, value),
            },
          ]}
        >
          <Input />
        </Form.Item>
      ),
    },
    {
      title: I18n.t('administration.proficiency_levels.fields.level_name'),
      dataIndex: 'name',
      render: (_: unknown, record, index: number) => (
        <Form.Item
          name={['levelDefinition', index, 'name']}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      ),
    },
    {
      title: I18n.t('administration.proficiency_levels.fields.level_description'),
      dataIndex: 'description',
      render: (_: unknown, record, index: number) => (
        <Form.Item
          name={['levelDefinition', index, 'description']}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      ),
    },
  ]

  const debouncedFetchSkills = useCallback(debounce((value) => {
    fetchSkills({
      apiConfig: {
        filter: { name_cont: value },
      },
    })
  }, 300), [])

  useEffect(() => {
    const newLevelDefinitions = Array.from({ length: selectedLevel }).map((_, idx: number) => ({
      name: '', description: '', level: idx + 1,
    }))
    setLevelDefinitions(newLevelDefinitions)
  }, [selectedLevel])

  useEffect(() => {
    form.setFieldValue('levelDefinition', levelDefinitions)
  }, [levelDefinitions])

  useEffect(() => {
    if (proficiencyLevel) {
      setLevelDefinitions(proficiencyLevel.levelDefinition)
    }
  }, [proficiencyLevel])

  const transformValues = (values) => {
    delete values.global
    delete values.ownerId
    return {
      ...values,
      ...(params.projectId ? { projectId: params.projectId } : {}),
    }
  }

  const renderClientSelector = () => {
    if (global) return null
    return (
      <Form.Item
        name="ownerId"
        label={I18n.t('common.column.client')}
        rules={[{ required: true }]}
      >
        <Select
          showSearch
          filterOption={false}
          placeholder={I18n.t('administration.skills.form.client_placeholder')}
          onSearch={searchAvailableOwners}
          notFoundContent={ownersLoading ? <Spin size="small" /> : null}
        >
          {
            owners.map(({ id, name }) => (
              <Select.Option key={id} value={id}>{name}</Select.Option>
            ))
          }
        </Select>
      </Form.Item>
    )
  }

  const renderProjectSelector = () => {
    if (proficiencyLevel && !proficiencyLevel?.project) {
      return null
    }

    if (global) {
      return null
    }

    return (
      <Form.Item
        name="projectId"
        label={I18n.t('common.column.project')}
        rules={[{ required: true }]}
      >
        <Select
          showSearch
          filterOption={false}
          disabled={!!proficiencyLevel}
          onSearch={handleProjectSearch}
          options={(getProjects() || []).map(p => ({
            value: p.id,
            label: p.name,
          }))}
          placeholder={I18n.t('administration.skills.form.project_placeholder')}
          value={form.getFieldValue('projectId')}
          notFoundContent={projectIsLoading('fetch') ? <Spin size="small" /> : null}
        />
      </Form.Item>
    )
  }

  return (
    <ResourceFormModal
      resourceName="proficiency_levels"
      resource={proficiencyLevel ? transformValues(proficiencyLevel) : undefined}
      readableResourceName={I18n.t('administration.proficiency_levels.fields.title')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{
        createResource: resource.createResource,
        updateResource: resource.updateResource,
      }}
      transformValues={transformValues}
    >
      {() => (
        <>
          <Form.Item
            name="proficiencyType"
            label={I18n.t('administration.proficiency_levels.fields.proficiency_type')}
            rules={[{ required: true }]}
          >
            <Select>
              {
                Object.values(convertEnumToObject(ProficiencyTypesEnum)).map(([, value]) => (
                  <Select.Option key={value} value={value}>
                    {I18n.t(`administration.proficiency_levels.type.${value}`)}
                  </Select.Option>
                ))
              }
            </Select>
          </Form.Item>
          {
            form.getFieldValue('proficiencyType') === 'by_skill' ? (
              <Form.Item
                name="skillId"
                label={I18n.t('administration.proficiency_levels.fields.skill')}
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  allowClear
                  loading={isSkillsLoading('fetch')}
                  onSearch={(value) => {
                    debouncedFetchSkills(value)
                  }}
                  notFoundContent={isSkillsLoading('fetch') ? <Spin size="small" /> : null}
                  filterOption={false}
                >
                  {skills?.map((item: Skill) => (
                    <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            ) : null
          }
          {
            (form.getFieldValue('proficiencyType') === 'by_category') ? (
              <Form.Item
                name="skillCategory"
                label={I18n.t('administration.proficiency_levels.fields.skill_category')}
                rules={[{ required: true }]}
              >
                <Select
                  filterOption={false}
                >
                  {
                    Object.values(convertEnumToObject(SkillTypeEnum)).map(([key, value]) => (
                      <Select.Option key={value} value={value}>{key}</Select.Option>
                    ))
                  }
                </Select>
              </Form.Item>
            ) : null
          }
          {!params.projectId && (
            <>
              {!proficiencyLevel && (
                <>
                  <Form.Item
                    name="global"
                    label={I18n.t('administration.proficiency_levels.global')}
                  >
                    <Switch />
                  </Form.Item>
                  {renderClientSelector()}
                </>
              )}
              {renderProjectSelector()}
            </>
          )}
          <Form.Item
            name="level"
            label={I18n.t('administration.proficiency_levels.fields.level')}
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              onChange={setSelectedLevel}
            >
              {Array.from({ length: 9 })?.map((_, index: number) => (
                <Select.Option key={index + 2} value={index + 2}>{index + 2}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          {
            form.getFieldValue('level') > 0 ? (
              <Table
                scroll={{ y: 320 }}
                rowKey={record => record.key}
                dataSource={levelDefinitions}
                columns={columns}
                pagination={false}
                bordered={false}
                rowHoverable={false}
                className={styles.table}
              />
            ) : null
          }
        </>
      )}
    </ResourceFormModal>
  )
}
