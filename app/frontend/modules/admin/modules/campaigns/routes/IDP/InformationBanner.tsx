import {
  useEffect,
} from 'react'
import {
  Flex,
  Avatar,
  Typography, Divider,
} from 'antd'
import {
  useParams,
} from 'react-router-dom'
import { useResources } from '~/hooks/useResources'
import { IdpUser } from '~/modules/admin/modules/campaigns/core/UserIdpPlan'

export const InformationBanner = () => {
  const { user_id } = useParams()

  const {
    data: user, fetchSingle: fetchUser, isLoading: isUserLoading,
  } = useResources<IdpUser>('users')

  useEffect(() => {
    fetchUser({ id: user_id as string })
  }, [user_id])


  if (isUserLoading('fetch')) return null

  return (
    <Flex justify="space-between" gap="large" style={{ backgroundColor: '#FAFAFA', padding: '1rem', flexWrap: 'wrap' }}>
      <Flex>
        <Avatar size={32} src={user[0]?.photoUrl} style={{ marginRight: '8px' }} />
        <Flex vertical>
          <Typography.Text>
            {user[0]?.fullName}
          </Typography.Text>
          <Typography.Text>
            {user[0]?.email}
          </Typography.Text>
        </Flex>
      </Flex>

      <Divider type="vertical" style={{ height: '2.5rem', alignSelf: 'center' }} />
    </Flex>
  )
}
