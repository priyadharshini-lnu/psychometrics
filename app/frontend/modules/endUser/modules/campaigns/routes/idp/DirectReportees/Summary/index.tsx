import { useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Flex, Typography, Spin, Tag, Empty, Button, message,
} from 'antd'
import { SafeHTML } from '~/components/SafeHTML'
import { fetchUserIdpPlanChangesForSummary, updateUserIdpPlan }
  from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { Separator } from '~/components/IdpShared/Separator'
import { ChangeStatusColors, ActionStatusInfo, PlanChangeStatus } from '../../../../core/idp/utils'
import { USER_IDP_PLAN_STATUS } from '~/components/IdpShared/constants'
import { ApprovalRejectionPopover } from '../../components/ApprovalRejectionPopover'

const { I18n } = window

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

type SummaryComponentProps = {
  setCurrentSummary: (reportee: { reporteeId: number, reporteeName: string } | null) => void
  reportee: { reporteeId: number, reporteeName: string }
  refetchDirectReportees: (reportee: { reporteeId: number, reporteeName: string } | null) => void
}

const connector = connect((state: RootState) => ({
  summary: state.campaigns.idp.summary,
}),
{
  fetchUserIdpPlanChangesForSummary,
  updateUserIdpPlan,
})
export const SummaryComponent: React.FC<SummaryComponentProps & Props> = ({
  summary, setCurrentSummary, reportee, fetchUserIdpPlanChangesForSummary, updateUserIdpPlan, refetchDirectReportees,
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isRejectPopoverOpen, setIsRejectPopoverOpen] = useState(false)
  const [isApprovePopoverOpen, setIsApprovePopoverOpen] = useState(false)


  useEffect(() => {
    fetchUserIdpPlanChangesForSummary(reportee.reporteeId.toString()).finally(() => {
      setIsLoading(false)
    })
  }, [reportee])

  const updateReporteeIdpStatus = (status: string, note = '') => {
    setIsLoading(true)
    updateUserIdpPlan(reportee.reporteeId.toString(), status, note).then(() => {
      refetchDirectReportees(null)
    }).catch(() => {
      message.error(I18n.t('common.errors.something_wrong'))
    }).finally(() => { setIsLoading(false) })
  }

  return (
    <Spin spinning={isLoading}>
      <Flex
        vertical
      >
        {summary.message ? (
          <Empty description={summary.message} />
        ) : (
          Object.keys(summary).length > 0 && (
            <Flex vertical>
              <Flex vertical>
                {Object.keys(summary).map(skillName => (
                  <Flex vertical gap={8} key={skillName}>
                    <Typography.Title className="mb-0 mt-0" level={5} style={{ fontSize: '1rem' }}>
                      {skillName}
                    </Typography.Title>
                    <Tag style={{ width: 'fit-content' }} color={ChangeStatusColors[summary[skillName].changeStatus]}>
                      {I18n.t(`shared.${summary[skillName].changeStatus.toLowerCase()}`)}
                    </Tag>
                    {summary[skillName].actions.length > 0 && (
                      <ul className="ps-4">
                        {summary[skillName].actions.map(action => (
                          <li key={action.id} style={{ marginTop: '8px' }}>
                            <Typography.Text>
                              {`${ActionStatusInfo[action.changeStatus]}: `}
                              <Tag
                                style={{ width: 'fit-content' }}
                                color={ChangeStatusColors[action.changeStatus]}
                              >
                                {action.name}
                              </Tag>
                            </Typography.Text>
                            {
                              action.changeStatus === PlanChangeStatus.EDITED && (
                                <ul className="ps-4 mt-2">
                                  {action.changeLog.map((change, index) => (
                                    <li key={index}>
                                      <SafeHTML html={change} />
                                    </li>
                                  ))}
                                </ul>
                              )
                            }
                          </li>
                        ))}
                      </ul>
                    )}
                    <Separator className="mb-4 mt-4" />
                  </Flex>
                ))}
              </Flex>
              <Flex gap={4} justify="end">
                <ApprovalRejectionPopover
                  isLoading={isLoading}
                  isOpen={isRejectPopoverOpen}
                  setOpen={setIsRejectPopoverOpen}
                  clickHandler={(reason:string) => {
                    setCurrentSummary(null)
                    updateReporteeIdpStatus(USER_IDP_PLAN_STATUS.REJECTED, reason)
                  }}
                  placeholder={I18n.t('enduser.add_idp_plan_rejection_reason')}
                  title={I18n.t('enduser.reject_idp_plan')}
                  allowDisabling
                >
                  <Button
                    type="default"
                    disabled={isLoading}
                  >
                    {I18n.t('common.actions.reject')}
                  </Button>
                </ApprovalRejectionPopover>

                <ApprovalRejectionPopover
                  isLoading={isLoading}
                  clickHandler={
                    (note: string) => {
                      setCurrentSummary(null)
                      updateReporteeIdpStatus(USER_IDP_PLAN_STATUS.APPROVED, note)
                    }}
                  isOpen={isApprovePopoverOpen}
                  setOpen={setIsApprovePopoverOpen}
                  placeholder={I18n.t('enduser.add_idp_plan_note')}
                  title={I18n.t('enduser.approve_idp_plan')}
                >
                  <Button
                    type="primary"
                    disabled={isLoading}
                  >
                    {I18n.t('common.actions.approve')}
                  </Button>
                </ApprovalRejectionPopover>
              </Flex>
            </Flex>
          )
        )}
      </Flex>
    </Spin>
  )
}

export const Summary = connector(SummaryComponent)
