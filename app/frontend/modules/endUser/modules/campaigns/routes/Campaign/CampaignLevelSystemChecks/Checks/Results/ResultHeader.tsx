
import {
  Typography, Flex,
} from 'antd'
import {
  useSelector,
} from 'react-redux'
import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  CheckCircleOutlined, CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window

export const ResultHeader = () => {
  const campaignDetailsForSystemCheck = useSelector(
    (state: RootState) => state.campaigns.systemCheck.currentCampaignForSystemCheck,
  )

  const { systemCheckStatusPassed = false } = campaignDetailsForSystemCheck || {}

  return (
    <Flex vertical align="center" gap={8}>
      {systemCheckStatusPassed ? (
        <>
          <CheckCircleOutlined style={{ color: 'var(--ant-success-color)', fontSize: '4rem' }} />
          <Typography.Title className="mb-0 mt-0" level={3}>{I18n.t('enduser.system_check_complete')}</Typography.Title>
          <Typography.Text>{I18n.t('enduser.system_check_passed_successfully')}</Typography.Text>
        </>
      ) : (
        <>
          {campaignDetailsForSystemCheck?.campaignOptions.allowContinueWithWarning && (
            <>
              <ExclamationCircleOutlined style={{ color: 'var(--ant-warning-color)', fontSize: '4rem' }} />
              <Typography.Title className="mb-0 mt-0" level={3}>
                {I18n.t('enduser.system_check_warning')}
              </Typography.Title>
              <Typography.Text>
                {}
                {I18n.t('enduser.system_check_warning_message')}
              </Typography.Text>
            </>
          )}
          {!campaignDetailsForSystemCheck?.campaignOptions.allowContinueWithWarning && (
            <>
              <CloseCircleOutlined style={{ color: 'var(--ant-error-color)', fontSize: '4rem' }} />
              <Typography.Title className="mb-0 mt-0" level={3}>
                {I18n.t('enduser.system_check_failed')}
              </Typography.Title>
              <Typography.Text>{I18n.t('enduser.system_check_failed_message')}</Typography.Text>
            </>
          )}
        </>

      )}
    </Flex>
  )
}
