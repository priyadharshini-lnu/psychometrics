import { FC, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Drawer, Descriptions, Row, Skeleton,
  Table,
  Tag,
} from 'antd'
import { Skill } from '~/modules/admin/modules/client/core/skills'
import { useResources } from '~/hooks/useResources'
import { ProficiencyLevel } from '~/modules/admin/modules/client/core/proficiencyLevels'

const { I18n } = window

const connector = connect(
  () => ({}),
  {},
)

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & {
  skill?: Skill
  onClose: () => void
}

const DetailsDrawerComponent: FC<Props> = ({
  skill,
  onClose,
}) => {
  const {
    data, setData, fetch, isLoading,
  } = useResources<ProficiencyLevel>(`skills/${skill?.id}/proficiency_levels`)

  const proficiencyLevel = data as unknown as ProficiencyLevel

  useEffect(() => {
    if (skill?.id) {
      fetch({
        apiConfig: {
          query: { project_id: skill.project?.id || '' },
        },
      }).catch(() => {
        setData([])
      })
    }
  }, [skill?.id])

  return (
    <Drawer
      title={I18n.t('admin.skills_skill_details')}
      onClose={onClose}
      placement="right"
      maskClosable
      closable
      open={!!skill}
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
            {skill?.id}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('shared.name')}
            key="description"
            className="va-t w-30"
            labelStyle={{ width: '30%' }}
            contentStyle={{ width: '70%' }}
          >
            {skill?.name}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('shared.description')}
            key="description"
            className="va-t w-30"
            labelStyle={{ width: '30%' }}
            contentStyle={{ width: '70%' }}
          >
            {skill?.description}
          </Descriptions.Item>
        </Descriptions>
        {
          proficiencyLevel?.proficiencyType ? (
            <Skeleton loading={isLoading('fetch')} active>
              <Descriptions
                title={I18n.t('admin.skills_applicable_proficiency_levels')}
                layout="horizontal"
                rootClassName="mb-6 w-100"
                bordered
                column={1}
              >
                <Descriptions.Item
                  label={I18n.t('admin.fields_proficiency_type')}
                  key="description"
                  className="va-t w-30"
                  labelStyle={{ width: '30%' }}
                  contentStyle={{ width: '70%' }}
                >
                  {I18n.t(`admin.type_${proficiencyLevel?.proficiencyType}`)}
                  {
                    !proficiencyLevel?.project?.id ? (
                      <Tag color="gold" bordered style={{ marginLeft: '10px' }}>Global</Tag>
                    ) : null
                  }
                </Descriptions.Item>
              </Descriptions>
              <Table
                style={{ width: '100%' }}
                dataSource={proficiencyLevel?.levelDefinition}
                columns={[
                  {
                    title: I18n.t('admin.fields_level'),
                    key: 'level',
                    dataIndex: 'level',
                  },
                  {
                    title: I18n.t('admin.fields_level_name'),
                    key: 'name',
                    dataIndex: 'name',
                  },
                  {
                    title: I18n.t('admin.fields_level_description'),
                    key: 'description',
                    dataIndex: 'description',
                  },
                ]}
                pagination={false}
              />
            </Skeleton>
          ) : null
        }
      </Row>
    </Drawer>
  )
}

export const DetailsDrawer = connector(DetailsDrawerComponent)
