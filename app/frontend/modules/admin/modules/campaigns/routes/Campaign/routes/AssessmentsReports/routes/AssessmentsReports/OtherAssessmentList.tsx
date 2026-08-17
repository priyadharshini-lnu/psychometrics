import React, { useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  Table, Row, Col, Pagination, App, Drawer, Descriptions,
} from 'antd'
import _ from 'lodash'
import { MoreOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { getTenantRowAttributes } from '~/utils/tableRowTenantAttributes'
import { fetchOtherAssessments, getOther } from '~/modules/admin/modules/campaigns/core/assessments'
import { OtherAssessment } from '~/modules/admin/modules/campaigns/interfaces/OtherAssessment'
import {
  rescoreResponses, remove, exportRawResults, exportScoringResults,
  exportNormedResults, exportRawFactorScores, exportAiFactorScores, exportExternalResults,
} from '~/modules/admin/modules/campaigns/core/assessments/actions'
import { openModal } from '~/modules/admin/core/ui/modals'
import { RootState } from '~/modules/admin/core/rootReducers'
import withEnhancedTable from '~/modules/admin/hoc/withEnhancedTable'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { TableProps } from '~/modules/admin/hoc/withEnhancedTable/interfaces'
import { getActionsMenuProps } from './AssessmentList/getActionsMenuProps'

const { Column } = Table
const { I18n } = window

interface OwnProps { }

const connector = connect(
  (state: RootState) => ({
    assessments: getOther(state),
    currentUser: state.currentUser,
    reports: state.campaigns.reports.list,
  }),
  {
    fetchOtherAssessments,
    openModal,
    rescoreResponses,
    remove,
    exportRawResults,
    exportScoringResults,
    exportNormedResults,
    exportRawFactorScores,
    exportAiFactorScores,
    exportExternalResults,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>


type Props = OwnProps & PropsFromRedux & TableProps

const OtherAssessmentListComponent: React.FC<Props> = ({
  tableConfig,
  assessments: {
    list,
    total,
  },
  openModal,
  changePage,
  fetchOtherAssessments,
  rescoreResponses,
  exportRawResults,
  exportScoringResults,
  exportNormedResults,
  exportRawFactorScores,
  exportAiFactorScores,
  exportExternalResults,
  onTableChange,
}) => {
  const [drawerAssessment, setDrawerAssessment] = useState<OtherAssessment | undefined>(undefined)
  useEffect(() => {
    fetchOtherAssessments(campaignId, tableConfig)
  }, [tableConfig.page])

  const { campaignId } = useParams() as { campaignId: string }
  const { message, modal } = App.useApp()

  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedPage = parseInt(tableConfig.page as unknown as string, 10)

  return (
    <>
      <Row>
        <Col span={24}>
          <Table<OtherAssessment>
            className="mtm"
            rowKey="id"
            dataSource={list}
            pagination={false}
            onChange={onTableChange}
            onRow={getTenantRowAttributes}
          >
            <Column
              title={I18n.t('common.column.id')}
              dataIndex="id"
              key="id"
            />
            <Column
              title={I18n.t('campaign_assessment.column.assessment_name')}
              key="name"
              dataIndex="name"
              render={(text: string, assessment: OtherAssessment) => (
                <a onClick={() => setDrawerAssessment(assessment)}>
                  {text}
                </a>
              )}
            />
            <Column
              title={I18n.t('common.column.category')}
              key="category"
              render={({ category }) => (
                I18n.t(`activerecord.attributes.assessment.categories.${category}`,
                  { defaultValue: _.capitalize(category) })
              )}
            />
            <Column
              title={I18n.t('common.column.action')}
              key="action"
              render={assessment => (
                <ConditionalDropdown
                  menu={
                    getActionsMenuProps({
                      assessment,
                      campaignId: parsedCampaignId,
                      openModal,
                      rescoreResponses: () => rescoreResponses(parsedCampaignId, assessment.id),
                      exportRawResults,
                      exportScoringResults,
                      exportNormedResults,
                      exportRawFactorScores,
                      exportAiFactorScores,
                      exportExternalResults,
                      optionsOverrides: { remove: false, updateExternalConfig: false },
                      message,
                      modal,
                    })
                  }
                  innerElement={(
                    <a>
                      <MoreOutlined />
                    </a>
                  )}
                />
              )}
            />
          </Table>
        </Col>
      </Row>
      <Row className="pt-4 pb-4 ps-4 pe-4">
        <Col>
          <Pagination
            hideOnSinglePage
            current={parsedPage}
            pageSize={tableConfig.pageSize}
            total={total}
            onChange={changePage}
          />
        </Col>
      </Row>
      {!!drawerAssessment && (
        <Drawer
          title={I18n.t('campaign_assessment.drawer.title')}
          placement="right"
          closable
          onClose={() => setDrawerAssessment(undefined)}
          open
          width="40%"
        >
          <Descriptions
            layout="horizontal"
            rootClassName="w-100"
            bordered
            column={1}
          >
            <Descriptions.Item
              label={I18n.t('campaign_assessment.column.assessment_name')}
              key="name"
              className="va-t"
            >
              {drawerAssessment.name}
            </Descriptions.Item>
            <Descriptions.Item
              label={I18n.t('common.column.owner')}
              key="owner"
              className="va-t"
            >
              {drawerAssessment.owner?.name || I18n.t('admin.tte')}
            </Descriptions.Item>
            <Descriptions.Item
              label={I18n.t('campaign_assessment.column.dimension_id')}
              key="dimension_id"
              className="va-t"
            >
              {drawerAssessment.dimensionId ?? '-'}
            </Descriptions.Item>
          </Descriptions>
        </Drawer>
      )}
    </>
  )
}

export const OtherAssessmentList = withEnhancedTable<OwnProps>(
  connector(OtherAssessmentListComponent),
  'otherAssessments',
  {
    maintainHistory: false,
    pageSize: 5,
  },
)
