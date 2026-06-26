import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  Table, Row, Col, Pagination, App,
} from 'antd'
import _ from 'lodash'
import { MoreOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { fetchOtherAssessments, getOther } from '~/modules/admin/modules/campaigns/core/assessments'
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
          <Table className="mtm" rowKey="id" dataSource={list} pagination={false} onChange={onTableChange}>
            <Column
              title={I18n.t('common.column.id')}
              dataIndex="id"
              key="id"
            />
            <Column
              title={I18n.t('campaign_assessment.column.assessment_name')}
              key="name"
              dataIndex="name"
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
