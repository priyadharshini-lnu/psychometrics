import {
  useEffect, useState, useMemo, useCallback,
} from 'react'
import {
  Table, Spin, Typography, Flex, Card, Button, Alert,
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
import { ButtonWithArrow, DirectionalBackArrowIcon } from '~/glint'
import { fetchCampaign } from '~/modules/endUser/modules/campaigns/core/campaign'
import { actions } from '~/modules/endUser/modules/campaigns/core/systemChecks/systemCheckRTK'
import { ResultHeader } from './ResultHeader'
import { CHECKS } from './common'
import { ResultDetails } from './ResultDetails'
import { SuccessTag, FailureTag } from '../../components/StatusTags'
import { CheckStepImage } from './CheckStepImage'
import styles from './styles.less'
import { InternationalizedDetails } from '../../common'

const { I18n } = window

const connector = connect(null,
  {
    fetchCampaign,
  })


const getTranslatedDetail = (detail: InternationalizedDetails) => I18n.t(detail.i18nKey,
  Object.fromEntries(detail.i18nVars || []))

const CheckDetails = ({ details, check, result }) => (

  <Alert
    type={result ? 'success' : 'error'}
    title={(
      <Flex className="p-2" vertical gap={8}>
        <Typography.Title className="mt-0 mb-0" level={5}>{check}</Typography.Title>
        <ul style={{ paddingInlineStart: '1.2rem' }}>
          {details.map((detail, index) => (
            <li key={index}>
              <Typography.Text>{getTranslatedDetail(detail)}</Typography.Text>
            </li>
          ))}
        </ul>
      </Flex>

    )}
    showIcon={false}
  />

)

const ResultsComponent = ({ onPrev, onNext, fetchCampaign }) => {
  const [resultsData, setResultsData] = useState<{key:string,
    check: string,
    result: boolean,
    details: Array<InternationalizedDetails>}[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { campaignId } = useParams() as { campaignId: string}

  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([])

  const { data: systemCheckResults, isLoading: isSystemCheckResultLoading } = useFetchSystemCheckResultsQuery(
    { campaignId },
    { refetchOnMountOrArgChange: true },
  )
  const {
    data:
    systemCheckRequirementsStatus,
  } = useFetchSystemCheckRequirementsStatusQuery({ campaignId }, { refetchOnMountOrArgChange: true })

  const dispatch = useDispatch()

  const [completeSystemCheckSession] = useCompleteSystemCheckSessionMutation()

  const campaignDetailsForSystemCheck = useSelector(
    (state: RootState) => state.campaigns.systemCheck.currentCampaignForSystemCheck,
  )

  const { systemCheckSessionId = null } = campaignDetailsForSystemCheck || {}

  useEffect(() => {
    completeSystemCheckSession({
      campaignId,
    }).then(() => {
      setIsLoading(false)
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

  const toggleExpand = (key) => {
    setExpandedRowKeys((prev) => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key)
      }
      return [...prev, key]
    })
  }

  const getOverallResult = useCallback(() => {
    if (systemCheckResults) {
      const allChecksPassed = Object.keys(systemCheckResults.records).every(
        key => systemCheckResults.records[key].passed === true,
      )
      return allChecksPassed
    }
    return false
  }, [systemCheckResults])

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
      ),
    },
    {
      title: <div style={{ textAlign: 'end' }}>{I18n.t('enduser.details')}</div>,
      dataIndex: 'details',
      key: 'details',
      render: (_, record) => (
        <Flex justify="end">
          <Button className="pe-0" type="link" onClick={() => toggleExpand(record.key)}>
            {expandedRowKeys.includes(record.key) ? I18n.t('enduser.hide_details') : I18n.t('enduser.view_details')}
          </Button>
        </Flex>

      ),
    },
  ]), [resultsData, expandedRowKeys])


  const formatData = data => Object.keys(data).sort().reduce((acc:{key:string,
    check:string, result:boolean, details:Array<InternationalizedDetails>}[],
  item) => {
    acc = acc.concat({
      key: CHECKS[data[item].checkType],
      check: CHECKS[data[item].checkType],
      result: data[item].passed,
      details: data[item].data.details,
    })
    return acc
  }, [])

  useEffect(() => {
    if (!systemCheckResults) return
    setResultsData(formatData(systemCheckResults?.records))
  }, [systemCheckResults])

  const handleNext = () => {
    if (getOverallResult() || campaignDetailsForSystemCheck?.campaignOptions.allowContinueWithWarning) {
      onNext()
    } else {
      window.location.href = '/'
    }
  }


  return (
    <Flex justify="center" flex={1} style={{ width: '100%' }}>
      {(isLoading || isSystemCheckResultLoading) ? <Spin />
        : (
          <Flex
            gap={8}
            vertical
            justify="center"
            align="center"
            style={{ width: '100%' }}
          >
            <ResultHeader isLoading={isSystemCheckResultLoading} result={getOverallResult()} />
            <Table
              style={{ width: '100%' }}
              pagination={false}
              rowKey={record => record.key}
              columns={columns}
              className={styles['results-table']}
              dataSource={resultsData}
              expandable={{
                expandedRowRender: record => (
                  <CheckDetails check={record.check} details={record.details} result={record.result} />
                ),
                expandedRowKeys,
                expandRowByClick: false,
                showExpandColumn: false,
              }}
            />

            {!getOverallResult()
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
                {!getOverallResult() && (
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
                  onClick={handleNext}
                />
              </Flex>
            </Flex>

          </Flex>
        )}
    </Flex>
  )
}

export const Results = connector(ResultsComponent)
