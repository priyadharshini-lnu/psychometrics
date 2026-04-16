import {
  useEffect, useState, useCallback,
} from 'react'
import { useSelector, useDispatch, connect } from 'react-redux'
import {
  Flex, Typography, Checkbox, Layout,
} from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { ButtonWithArrow } from '~/glint'
import {
  useAddSystemCheckSessionMutation, useFetchSystemCheckRequirementsStatusQuery,
} from '~/modules/endUser/modules/campaigns/core/systemChecks/api'
import { actions } from '~/modules/endUser/modules/campaigns/core/systemChecks/systemCheckRTK'
import { LayoutWrapper } from '../LayoutWrapper'
import { fetchCampaign } from '~/modules/endUser/modules/campaigns/core/campaign'
import { RequirementStatus } from '~/modules/endUser/modules/campaigns/core/systemChecks/interfaces'
import commonStyles from '../common-styles.less'
import { TopSection } from './TopSection'
import { CampaignNameComponent } from '../components/CampaignNameComponent'
import { MiddleSection } from './MiddleSection'

const { I18n } = window
const connector = connect(null,
  {
    fetchCampaign,
  })
const WelcomeComponent = ({ fetchCampaign }) => {
  const campaignDetailsForSystemCheck = useSelector(
    (state: RootState) => state.campaigns.systemCheck.currentCampaignForSystemCheck,
  )

  const { requiredSystemChecks = [], campaignName = '' } = campaignDetailsForSystemCheck || {}
  const navigate = useNavigate()

  const dispatch = useDispatch()

  const [acknowledged, setAcknowledged] = useState(false)
  const [addSystemCheckSession] = useAddSystemCheckSessionMutation()
  const { campaignId } = useParams() as { campaignId: string}

  const {
    data:
    systemCheckRequirementsStatus,
  } = useFetchSystemCheckRequirementsStatusQuery({ campaignId }, { refetchOnMountOrArgChange: true })

  const onChange = (e) => {
    setAcknowledged(e.target.checked)
  }

  const handleNext = useCallback(async () => {
    const response = await addSystemCheckSession({ campaignId }).unwrap()
    const { id: sessionId } = response
    dispatch(actions.setSystemCheckSessionId(sessionId))
    navigate(`/campaign_system_check/${campaignId}/${requiredSystemChecks[0]}`)
  }, [requiredSystemChecks])

  useEffect(() => {
    fetchCampaign(`/campaigns/${campaignId}`).then(({ response }) => {
      dispatch(actions.setCampaignDetailsForSystemCheck(response))

      if (!systemCheckRequirementsStatus) return
      const validChecks = Object.keys((systemCheckRequirementsStatus as RequirementStatus)?.requirements).filter(
        key => systemCheckRequirementsStatus?.requirements[key]?.required === true,
      )

      dispatch(actions.setRequiredSystemChecks(validChecks))

      if (validChecks.includes('network')) {
        dispatch(actions.setNetworkSpeeds({
          minimumDownloadSpeed: systemCheckRequirementsStatus?.requirements?.network?.minimumDownloadSpeed,
          minimumUploadSpeed: systemCheckRequirementsStatus?.requirements?.network?.minimumUploadSpeed,
        }))
      }
    })
  }, [campaignId, systemCheckRequirementsStatus])

  return (
    <LayoutWrapper>
      <Layout.Content>
        <CampaignNameComponent campaignName={campaignName} />
        <Flex
          justify="center"
          className="mb-2"
          vertical
          style={{
            maxWidth: '900px', width: '100%', alignSelf: 'center',
          }}
        >
          <Flex justify="center">
            <Flex vertical gap={16}>
              <TopSection />
              <MiddleSection />
              <Flex
                vertical
                className={`p-4 ${commonStyles['border-dark']} ${commonStyles['bg-off-white']}`}
              >
                <Checkbox onChange={onChange} disabled={!requiredSystemChecks.length}>
                  {I18n.t('enduser.ack_title')}
                </Checkbox>
                <Typography.Text style={{ paddingInlineStart: '24px' }}>
                  {I18n.t('enduser.ack_subtitle')}
                </Typography.Text>
              </Flex>
              <ButtonWithArrow
                style={{ alignSelf: 'flex-end' }}
                className="mb-2"
                label={I18n.t('enduser.start_system_check')}
                type="primary"
                onClick={handleNext}
                disabled={!acknowledged}
              />
            </Flex>
          </Flex>
        </Flex>
      </Layout.Content>
    </LayoutWrapper>
  )
}

export const Welcome = connector(WelcomeComponent)
