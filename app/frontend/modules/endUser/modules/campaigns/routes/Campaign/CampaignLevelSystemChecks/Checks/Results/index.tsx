import {
  useEffect, useState, useMemo, useContext,
} from 'react'
import {
  Table, Spin, Typography, Flex, Card, Button,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useSelector, useDispatch, connect,
} from 'react-redux'
import {
  useFetchSystemCheckResultsQuery, useFetchSystemCheckRequirementsStatusQuery, useCompleteSystemCheckSessionMutation,
} from '~/modules/endUser/modules/campaigns/core/systemChecks/api'
import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  RedoOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { ButtonWithArrow, MediaQueryContext, DirectionalBackArrowIcon } from '~/glint'
import { fetchCampaign } from '~/modules/endUser/modules/campaigns/core/campaign'
import { actions } from '~/modules/endUser/modules/campaigns/core/systemChecks/systemCheckRTK'
import { ResultHeader } from './ResultHeader'
import { CHECKS } from './common'
import { ResultDetails } from './ResultDetails'
import { SuccessTag, FailureTag } from '../../components/StatusTags'
import { CheckStepImage } from './CheckStepImage'

const { I18n } = window

const connector = connect(null,
  {
    fetchCampaign,
  })
const ResultsComponent = ({ onPrev, onNext, fetchCampaign }) => {
  const [resultsData, setResultsData] = useState<{check: string, result: boolean}[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { campaignId } = useParams() as { campaignId: string}

  const { data: systemCheckResults } = useFetchSystemCheckResultsQuery({ campaignId })
  const {
    data:
    systemCheckRequirementsStatus,
  } = useFetchSystemCheckRequirementsStatusQuery({ campaignId })

  const { isMobile } = useContext(MediaQueryContext)
  const dispatch = useDispatch()

  const [completeSystemCheckSession] = useCompleteSystemCheckSessionMutation()

  const campaignDetailsForSystemCheck = useSelector(
    (state: RootState) => state.campaigns.systemCheck.currentCampaignForSystemCheck,
  )

  const { systemCheckSessionId = null, systemCheckStatusPassed = false } = campaignDetailsForSystemCheck || {}

  useEffect(() => {
    completeSystemCheckSession({
      campaignId,
    })
  }, [])

  useEffect(() => {
    if (!systemCheckSessionId && systemCheckRequirementsStatus && systemCheckResults) {
      fetchCampaign(`/campaigns/${campaignId}`).then(({ response }) => {
        dispatch(actions.setCampaignDetailsForSystemCheck(response))

        const validChecks = Object.keys((systemCheckRequirementsStatus)?.requirements).filter(
          key => systemCheckRequirementsStatus?.requirements[key]?.required === true,
        )

        const systemCheckPassedStatus = systemCheckResults.records ? Object.keys(systemCheckResults.records).every(
          key => systemCheckResults.records[key].passed === true,
        ) : false

        dispatch(actions.setRequiredSystemChecks(validChecks))

        dispatch(actions.setSystemCheckStatusPassed(systemCheckPassedStatus))

        if (validChecks.includes('network')) {
          dispatch(actions.setNetworkSpeeds({
            minimumDownloadSpeed: systemCheckRequirementsStatus?.requirements?.network?.minimumDownloadSpeed,
            minimumUploadSpeed: systemCheckRequirementsStatus?.requirements?.network?.minimumUploadSpeed,
          }))
        }
      }).finally(() => {
        setIsLoading(false)
      })
    }
  }, [systemCheckSessionId, systemCheckRequirementsStatus, systemCheckResults])

  const navigate = useNavigate()

  const columns = useMemo(() => ([
    {
      title: I18n.t('enduser.check'),
      dataIndex: 'check',
      key: 'check',
      render: check => (
        <Flex gap={8}>
          <CheckStepImage checkType={check} />
          <Typography.Text>{check}</Typography.Text>
        </Flex>

      ),
    },
    {
      title: <div style={{ textAlign: 'end' }}>{I18n.t('enduser.result')}</div>,
      dataIndex: 'result',
      key: 'result',
      render: result => (
        <Flex justify="end">
          <Typography.Text>
            { result ? (
              <SuccessTag />
            ) : (
              <FailureTag />
            )}
          </Typography.Text>
        </Flex>
      )
      ,
    },
  ]), [resultsData])

  const formatData = data => Object.keys(data).sort().reduce((acc:{check:string, result:boolean}[], item) => {
    acc = acc.concat({
      check: CHECKS[data[item].checkType],
      result: data[item].passed,
    })
    return acc
  }, [])

  useEffect(() => {
    if (!systemCheckResults) return
    setResultsData(formatData(systemCheckResults?.records))
    setIsLoading(false)
  }, [systemCheckResults])

  return (
    <Flex justify="center" flex={1} style={{ width: '100%' }}>
      {isLoading ? <Spin />
        : (
          <Flex
            gap={8}
            vertical
            justify="center"
            align="center"
            style={{ ...(!isMobile && { padding: '1rem' }), width: '100%' }}
          >
            <ResultHeader />
            <Table style={{ width: '100%' }} pagination={false} columns={columns} dataSource={resultsData} />

            {!systemCheckStatusPassed
            && !campaignDetailsForSystemCheck?.campaignOptions.allowContinueWithWarning && (
              <Card style={{ width: '100%', padding: '1rem', backgroundColor: 'rgba(240, 240, 240, 1)' }}>
                <Flex
                  vertical
                  style={{ width: '100%', textAlign: 'center' }}
                  justify="center"
                  align="center"
                >
                  <p
                    className="mb-0"
                    style={{
                      fontWeight: 'bold',
                      color: 'var(--ant-error-color)',
                    }}
                  >
                    {I18n.t('enduser.system_check_failed_title')}
                  </p>
                  <p>
                    {I18n.t('enduser.system_check_failed_description')}
                  </p>
                </Flex>
              </Card>
            ) }
            <ResultDetails resultsData={resultsData} />
            <Flex style={{ width: '100%' }} justify="space-between">
              <Button className="mt-2" icon={<DirectionalBackArrowIcon />} onClick={onPrev}>
                {I18n.t('enduser.back')}
              </Button>
              <Flex gap={4} style={{ width: '100%' }} justify="end">
                {(systemCheckStatusPassed || (!systemCheckStatusPassed
            && campaignDetailsForSystemCheck?.campaignOptions.allowContinueWithWarning)) && (
              <Button
                className="mt-2"
                icon={<RedoOutlined />}
                onClick={
                  () => {
                    navigate(`/campaign_system_check/${campaignId}/welcome`)
                  }
                }
              >
                {I18n.t('enduser.rerun_checks')}
              </Button>
                )}
                <ButtonWithArrow
                  style={{ alignSelf: 'flex-end' }}
                  label={I18n.t('shared.continue')}
                  type="primary"
                  onClick={onNext}
                  disabled={!systemCheckStatusPassed
                  && !campaignDetailsForSystemCheck?.campaignOptions.allowContinueWithWarning}
                />
              </Flex>
            </Flex>

          </Flex>
        )}
    </Flex>
  )
}

export const Results = connector(ResultsComponent)
