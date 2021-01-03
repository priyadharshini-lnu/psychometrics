
import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { getCurrent, fetchSingle } from 'modules/admin/modules/AssessorApp/core/users'
import { get as getUserAssessments } from 'modules/admin/modules/AssessorApp/core/userAssessments'
import {
  Table, Row, Col, Dropdown, Menu, PageHeader,
} from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { RootState } from 'modules/admin/core/rootReducers'
import withEnhancedTable from 'modules/admin/hoc/withEnhancedTable'
import { TableProps } from 'modules/admin/hoc/withEnhancedTable/interfaces'
import Breadcrumb from 'modules/admin/modules/campaigns/components/Breadcrumb'

const connecter = connect(
  (state: RootState) => ({
    user: getCurrent(state),
    userAssessments: getUserAssessments(state),
  }),
  {
    fetchSingle,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

type Props = TableProps & PropsFromRedux

const { Column } = Table
const { I18n } = window

const UserDetails: React.FC<Props> = (
  {
    user,
    userAssessments,
    fetchSingle,
  },
) => {
  const { campaignId, userId } = useParams<{ campaignId?: string, userId?: string }>()
  let parsedCampaignId; let
    parsedUserId: null | number = null
  if (campaignId) { parsedCampaignId = parseInt(campaignId, 10) }
  if (userId) { parsedUserId = parseInt(userId, 10) }

  useEffect(() => {
    if (parsedCampaignId && parsedUserId) { fetchSingle(parsedCampaignId, parsedUserId) }
  }, [])

  if (!parsedCampaignId || !user) { return null }

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
          link: () => `/assessors/campaigns/${campaignId}/users`,
        },
        {
          label: () => user?.email,
        },
        ]}
      />
      <PageHeader
        ghost={false}
        title={user.fullName}
        subTitle={user.email}
      />
      <div className="pl">
        <h3>{I18n.t('common.model.assessments')}</h3>
        <Row>
          <Col span={24}>
            <Table className="mtm mbl" rowKey="id" dataSource={userAssessments} pagination={false}>
              <Column
                title={I18n.t('common.column.id')}
                dataIndex="id"
                key="id"
              />
              <Column
                title={I18n.t('campaign_assessment.column.assessment_name')}
                key="assessmentName"
                dataIndex="assessmentName"
              />
              <Column
                title={I18n.t('common.column.status')}
                key="status"
                render={({ status }) => I18n.t(`campaign_assessment.statuses.${status}`)}
              />
              <Column
                title={I18n.t('common.column.action')}
                key="action"
                render={() => (
                  <Dropdown
                    overlay={() => (
                    ActionsMenu({}) as React.ReactElement
                    )}
                    trigger={['click']}
                  >
                    <a>
                      <MoreOutlined />
                    </a>
                  </Dropdown>
                )}
              />
            </Table>
          </Col>
        </Row>
      </div>
    </>
  )
}

const ActionsMenu: React.FC = () => {
  const handleEvaluate = () => {}

  return (
    <Menu>
      <Menu.Item key="evaluate">
        <div
          role="button"
          tabIndex={-1}
          onClick={handleEvaluate}
        >
          {I18n.t('assessments.actions.evaluate')}
        </div>
      </Menu.Item>
    </Menu>
  )
}

export default withEnhancedTable(connecter(UserDetails), 'assessorsUserDetails', { maintainHistory: true })
