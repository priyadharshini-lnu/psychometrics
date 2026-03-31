import {
  Flex, Tooltip, Button, Typography,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import { DirectionalBackArrowIcon } from '~/glint'

const { I18n } = window

export const CampaignNameComponent = ({ campaignName = '' }: {campaignName:string}) => {
  const navigate = useNavigate()

  return (
    <Flex>
      <Tooltip title={I18n.t('enduser.back_to_dashboard')}>
        <Button
          className="border-none mb-2"
          aria-label={I18n.t('enduser.back_to_dashboard')}
          icon={<DirectionalBackArrowIcon className="fs-16" />}
          onClick={() => {
            navigate('/dashboard')
          }}
        />
      </Tooltip>
      <Typography.Title className="mt-0 mb-1" level={4}>{campaignName}</Typography.Title>
    </Flex>
  )
}
