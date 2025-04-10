import React, { useEffect } from 'react'
import {
  Table, Space, Input, Switch, Button, MenuProps, App,
} from 'antd'
import { useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { PlusOutlined } from '@ant-design/icons'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { useResources } from '~/hooks/useResources'
import { UpdateResource, BaseMeta } from '~/hooks/useResources/interfaces'
import { getErrorMsgFromJsonApiRequests } from '~/hooks/useResources/utils'
import { RootState } from '~/modules/admin/core/rootReducers'
import { openModal } from '~/modules/admin/core/ui/modals'
import Modals from '~/modules/admin/components/Modals'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { get as getCurrentUser } from '~/core/currentUser'
import { AddEditAssessmentModal } from './AddEditAssessmentModal/AddEditAssessmentModal'
import {
  ProjectAssessment, ProjectAssessmentTR,
} from '~/modules/admin/modules/client/core/projectAssessments'
import { getClientId } from '~/modules/admin/modules/client/core/projects'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const MODALS = {
  AddEditAssessmentModal,
}
const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
    clientId: getClientId(state),
  }), {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const { I18n } = window
const { Column } = Table

const AssessmentListComponent: React.FC<Props> = ({ openModal, clientId }) => {
  const { projectId } = useParams()

  const {
    data, meta, fetch, isLoading, getSortOrder, handleTableChange,
    createResource, updateResource, getFilteredValue, changeFilter,
    requests, removeResource,
  } = useResources<ProjectAssessment, BaseMeta>(
    'project_assessments',
    {
      basePath: `projects/${projectId}`,
      trackUrl: true,
      responseType: ProjectAssessmentTR,
      apiConfig: {
        include: ['assessment'],
        fields: {
          assessments: ['name'],
        },
      },
    },
  )

  useEffect(() => {
    fetch()
  }, [projectId])

  const tableLoading = isLoading('fetch')

  const { modal, message } = App.useApp()

  const toggleNormalizeFactorScore = (record: ProjectAssessment) => {
    updateResource({
      id: record.id,
      normalizeFactorScores: !record.normalizeFactorScores,
    })
  }

  const removeAssessment = (projectAssessment: ProjectAssessment) => {
    modal.confirm({
      title: I18n.t('administration.project_tabs.assessments.delete.title'),
      content: I18n.t(
        'administration.project_tabs.assessments.delete.content',
        {
          name: projectAssessment.assessment.name,
        },
      ),
      okText: I18n.t('administration.administrators.modals.delete.okText'),
      cancelText: I18n.t('administration.administrators.modals.delete.cancelText'),
      onOk: () => removeResource(projectAssessment.id).then(() => {
        message.success(
          I18n.t('administration.project_tabs.assessments.delete.success', {
            name: projectAssessment.assessment.name,
          }),
        )
        close()
      }).catch((error) => {
        message.error(error)
      }),
    })
  }

  const AssessmentsTable = (
    <>
      <Table
        dataSource={data}
        loading={tableLoading}
        onChange={handleTableChange}
        pagination={false}
      >
        <Column
          title={I18n.t('common.column.id')}
          dataIndex={['assessment', 'id']}
          key="assessment.id"
          sorter
          sortOrder={getSortOrder('assessment.id')}
        />
        <Column
          title={I18n.t('administration.project_tabs.assessments.column.normalize_factor_scores')}
          key="normalize_factor_scores"
          render={assessment => (
            <Switch
              checked={assessment.normalizeFactorScores}
              onChange={() => toggleNormalizeFactorScore(assessment)}
            />
          )}
        />
        <Column
          title={I18n.t('administration.project_tabs.assessments.column.user_result_validity_in_days')}
          dataIndex="userResultValidityInDays"
          key="userResultValidityInDays"
          render={value => (value === null ? 'N/A' : `${value} days`)}
        />
        <Column
          title={I18n.t('administration.project_tabs.assessments.column.name')}
          dataIndex={['assessment', 'name']}
          key="assessment.name"
          sorter
          sortOrder={getSortOrder('assessment.name')}
        />
        <Column
          title={I18n.t('common.column.created_date')}
          dataIndex="createdAt"
          key="createdAt"
          sorter
          sortOrder={getSortOrder('createdAt')}
        />
        <Column
          title={I18n.t('common.column.modified_date')}
          dataIndex="updatedAt"
          key="updatedAt"
          sorter
          sortOrder={getSortOrder('updatedAt')}
        />
        <Column
          title="Actions"
          key="actions"
          render={projectAssessment => (
            <ConditionalDropdown
              menu={
                getActionMenuProps({
                  projectAssessment,
                  removeAssessment,
                  updateAssessment: updateResource,
                  openModal,
                  clientId,
                })
              }
            />
          )}
        />
      </Table>
    </>
  )

  const Filter = (
    <Space>
      <Input.Search
        placeholder={I18n.t('administration.projects.assessment_settings.search')}
        value={getFilteredValue('filterable_fields')}
        onChange={e => changeFilter('filterable_fields', e.target.value)}
      />
      <Button
        icon={<PlusOutlined />}
        type="primary"
        disabled={tableLoading}
        onClick={() => {
          openModal(
            'AddEditAssessmentModal',
            {
              addAssessment: createResource,
              clientId,
            },
          )
        }}
      >
        {I18n.t('common.actions.add')}
      </Button>
    </Space>
  )

  return (
    <>
      <TableLayout
        table={AssessmentsTable}
        filters={Filter}
        recordCount={meta.recordCount}
        loading={tableLoading}
        requestStatus={requests.fetch?.status}
        failureMsg={getErrorMsgFromJsonApiRequests(requests)}
      />
      <Modals modals={MODALS} />
    </>
  )
}

interface ActionMenuData {
  projectAssessment: ProjectAssessment
  removeAssessment: (assessment: ProjectAssessment) => void
  updateAssessment: UpdateResource<ProjectAssessment>
  openModal(name: string, data: {
    projectAssessment: ProjectAssessment
    clientId?: number
    updateAssessment: UpdateResource<ProjectAssessment>
  })
  clientId: number
}

const getActionMenuProps = ({
  projectAssessment, removeAssessment, updateAssessment, openModal, clientId,
}:ActionMenuData):MenuProps => {
  const menuItems: ItemType[] = [
    {
      key: 'edit',
      label: I18n.t('common.actions.edit'),
    },
    {
      key: 'delete',
      label: I18n.t('common.actions.delete'),
    },
  ]

  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      openModal('AddEditAssessmentModal', {
        updateAssessment,
        projectAssessment,
        clientId,
      })
    } else if (key === 'delete') {
      removeAssessment(projectAssessment)
    }
  }
  return ({ items: menuItems, onClick: handleMenuClick })
}

export const Assessments = connecter(AssessmentListComponent)
