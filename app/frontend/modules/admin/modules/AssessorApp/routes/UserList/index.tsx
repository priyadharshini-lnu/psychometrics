
import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Table, Row, Col, Input, Pagination, Typography,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { AppstoreOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import settings from '~/modules/admin/settings'
import { get as getUsers, fetch } from '~/modules/admin/modules/AssessorApp/core/users'
import { RootState } from '~/modules/admin/core/rootReducers'
import withEnhancedTable from '~/modules/admin/hoc/withEnhancedTable'
import { TableProps } from '~/modules/admin/hoc/withEnhancedTable/interfaces'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import styles from './styles.less'

const connecter = connect(
  (state: RootState) => ({
    users: getUsers(state),
  }),
  {
    fetch,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

type Props = TableProps & PropsFromRedux

const { Column } = Table
const { Search } = Input
const { I18n } = window

const UserList: React.FC<Props> = (
  {
    users: { list, total },
    fetch,
    tableConfig: {
      filters,
      page,
    },
    tableConfig,
    changeFilter,
    onTableChange,
    getSortOrder,
    changePage,
  },
) => {
  const { campaignId } = useParams<{campaignId?: string}>()
  const navigate = useNavigate()
  let parsedCampaignId: null | number = null
  if (campaignId) { parsedCampaignId = parseInt(campaignId, 10) }
  if (!parsedCampaignId) { return null }

  useEffect(() => {
    if (parsedCampaignId) { fetch(parsedCampaignId, tableConfig) }
  }, [tableConfig])

  return (
    <>
      <Breadcrumb
        request={{
          fields: ['project', 'campaign', 'client'],
          data: { campaignId: parsedCampaignId },
        }}
        crumbs={[{
          link: () => '/assessors',
          label: () => I18n.t('common.model.campaigns'),
        }, {
          label: state => state.campaign.name,
        },
        ]}
      />
      <Row justify="space-between" className="pm">
        <Col span={4} className="pls">
          <AppstoreOutlined style={{ fontSize: '16px' }} />
          <span className="mlm">{`${total} ${I18n.t('admin.navigation_users')}`}</span>
        </Col>
        <div className="float-r">
          <Search
            placeholder={I18n.t('common.actions.search')}
            className={styles.searchInput}
            value={filters.filterableFields}
            onChange={e => changeFilter('filterableFields', e.target.value)}
          />
        </div>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            className="mtm"
            rowKey="id"
            dataSource={list}
            onChange={onTableChange}
            onRow={record => ({
              onClick: () => {
                navigate(`/assessors/campaigns/${campaignId}/users/${record.id}`)
              },
              className: styles.clickableRow,
            })}
            pagination={false}
          >
            <Column
              title={I18n.t('shared.id')}
              key="id"
              sorter
              sortOrder={getSortOrder('id')}
              render={({ id }) => (
                <Typography.Link>
                  {id}
                </Typography.Link>
              )}
            />
            <Column
              title={I18n.t('shared.name')}
              key="fullName"
              dataIndex="fullName"
              sorter
              sortOrder={getSortOrder('fullName')}
            />
            <Column
              title={I18n.t('shared.email')}
              key="email"
              sorter
              sortOrder={getSortOrder('email')}
              dataIndex="email"
            />
            <Column
              title={I18n.t('assessors.campaigns_list.column.evaluation_status')}
              key="status"
              render={({ evaluationCompletionStatus }) => (
                I18n.t(`admin.assessor_subjects_statuses_${evaluationCompletionStatus}`)
              )}
            />
            <Column
              title={I18n.t('assessors.campaigns_list.column.evaluation_count')}
              key="evaluationsCompleted"
              render={({ totalEvaluations, completedEvaluations }) => `${completedEvaluations} / ${totalEvaluations}`}
            />
            <Column
              title={I18n.t('assessors.campaigns_list.column.moderation_status')}
              key="status"
              render={({ moderationCompletionStatus }) => (
                I18n.t(`admin.assessor_subjects_statuses_${moderationCompletionStatus}`)
              )}
            />
            <Column
              title={I18n.t('assessors.campaigns_list.column.moderation_count')}
              key="evaluationsCompleted"
              render={({ totalModeration, completedModeration }) => `${completedModeration} / ${totalModeration}`}
            />
          </Table>
        </Col>
      </Row>
      <div className="pl">
        <Pagination
          current={page}
          pageSize={settings.pagination.defaultPageSize}
          total={total}
          onChange={changePage}
          hideOnSinglePage
        />
      </div>
    </>
  )
}

export default withEnhancedTable<{}>(connecter(UserList), 'assessorsUserList', { maintainHistory: true })
