import { FC, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Descriptions,
  Drawer, Row, Skeleton, Table, Typography,
} from 'antd'
import { useResources } from '~/hooks/useResources'
import { JobRole } from '~/modules/admin/modules/client/core/jobRoles'
import { JobRoleSkillMapping } from '~/modules/admin/modules/client/core/jobRoleSkillMappings'
import { ApiConfig } from '~/hooks/useResources/interfaces'

const { I18n } = window

const connector = connect(
  () => ({}),
  {},
)

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & {
  jobRole: JobRole
  onClose: () => void
}

const DetailsDrawerComponent: FC<Props> = ({
  jobRole,
  onClose,
}) => {
  const {
    data: jobRoleSkillMappings, fetch: fetchMappings, isLoading: isMappingsLoading,
  } = useResources<JobRoleSkillMapping>('skills_job_roles', {
    apiConfig: {
      include: ['project', 'skill'],
      fields: { skills: ['name'] },
      filter: {
        job_role_id_eq: jobRole.id,
      },
      ...(jobRole?.project?.id ? { project_id: jobRole?.project?.id } : {}),
    } as ApiConfig,
  })

  useEffect(() => {
    fetchMappings()
  }, [jobRole.id])

  return (
    <Drawer
      title={I18n.t('administration.job_role.job_role_details')}
      onClose={onClose}
      placement="right"
      maskClosable
      closable
      open
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
            label={I18n.t('common.column.id')}
            key="description"
            className="va-t w-30"
            labelStyle={{ width: '30%' }}
            contentStyle={{ width: '70%' }}
          >
            {jobRole.id}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('common.column.name')}
            key="description"
            className="va-t w-30"
            labelStyle={{ width: '30%' }}
            contentStyle={{ width: '70%' }}
          >
            {jobRole.name}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('common.column.code')}
            key="description"
            className="va-t w-30"
            labelStyle={{ width: '30%' }}
            contentStyle={{ width: '70%' }}
          >
            {jobRole.code}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('common.column.description')}
            key="description"
            className="va-t w-30"
            labelStyle={{ width: '30%' }}
            contentStyle={{ width: '70%' }}
          >
            {jobRole.description}
          </Descriptions.Item>
        </Descriptions>
        <Typography.Title level={5}>{I18n.t('administration.skills.title')}</Typography.Title>
        <Skeleton loading={isMappingsLoading('fetch')} active>
          <Table<JobRoleSkillMapping>
            style={{ width: '100%' }}
            dataSource={jobRoleSkillMappings}
            columns={[
              {
                title: I18n.t('administration.job_role.column.skill_id'),
                key: 'skillId',
                dataIndex: 'skillId',
              },
              {
                title: I18n.t('administration.job_role.column.skill_name'),
                key: 'skillName',
                dataIndex: 'skill.name',
                render: (_, mapping) => (
                  <Typography.Text>{mapping.skill?.name}</Typography.Text>
                ),
              },
              {
                title: I18n.t('administration.job_role_skill_mapping.column.expected_proficiency_level'),
                key: 'expectedProficiencyLevel',
                dataIndex: 'expectedProficiencyLevel',
              },
            ]}
            pagination={false}
          />
        </Skeleton>
      </Row>
    </Drawer>
  )
}

export const DetailsDrawer = connector(DetailsDrawerComponent)
