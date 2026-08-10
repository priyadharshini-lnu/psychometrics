import {
  useEffect,
} from 'react'
import {
  Flex,
  Avatar,
  Button,
  Typography,
  Divider,
} from 'antd'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  ArrowLeftOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import { IdpUser } from '~/modules/admin/modules/campaigns/core/UserIdpPlan'

export const InformationBanner = () => {
  const { campaignId, userId, projectId } = useParams()
  const navigate = useNavigate()

  const {
    data: user, fetchSingle: fetchUser, isLoading: isUserLoading,
  } = useResources<IdpUser>('users')

  useEffect(() => {
    fetchUser({ id: userId as string })
  }, [userId])

  const handleBack = () => {
    navigate(`/admin/projects/${projectId}/new_campaigns/${campaignId}/participants/subjects/${userId}/idp`)
  }


  if (isUserLoading('fetch')) return null

  return (
    <Flex style={{ backgroundColor: '#FAFAFA', padding: '1rem', flexWrap: 'wrap' }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={handleBack} />
      <Flex gap={8}>
        <Avatar size={32} src={user[0]?.photoUrl} style={{ marginInlineStart: '8px' }} />
        <Flex vertical>
          <Typography.Text>
            {user[0]?.fullName}
          </Typography.Text>
          <Typography.Text>
            {user[0]?.email}
          </Typography.Text>
        </Flex>
      </Flex>

      <Divider orientation="vertical" style={{ height: '2.5rem', alignSelf: 'center' }} />
    </Flex>
  )
}
