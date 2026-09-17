import {
  useEffect, useMemo, useState,
} from 'react'
import {
  useGlintToken,
  Avatar, Empty, Flex, Typography, Card, Skeleton,
} from '@thetalententerprise/glint'
import cs from 'classnames'
import { useParams } from 'react-router-dom'
import { UserOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import { User, UserProfile } from '~/modules/admin/modules/campaigns/core/user'
import styles from './Profile.less'

const { I18n } = window

interface Subject extends User {
  userProfile: UserProfile
}

type ProfileProps = {
  header: (title: string, withoutBorder?: boolean) => React.ReactNode
}

const EMPTY_VALUE = '-'

export const Profile = ({ header }: ProfileProps) => {
  const { campaignId, userId } = useParams() as { campaignId: string, userId: string }
  const [datasheetRowsData, setDatasheetRowsData] = useState<Record<string, string>>({})
  const token = useGlintToken()

  const {
    fetchSingle, getResource, isLoading,
  } = useResources<Subject>('users', {
    basePath: `/campaigns/${campaignId}`,
    apiConfig: {
      fields: { users: ['name', 'user_profile', 'email'] },
      include: ['user_profile'],
    },
  })

  const {
    collectionAction: fetchDatasheetRows,
  } = useResources('datasheet_rows', {
    apiConfig: {
      filter: {
        user_id: userId,
        campaign_id: campaignId,
      },
    },
  })

  useEffect(() => {
    fetchSingle({ id: userId })
    fetchDatasheetRows({
      action: 'datasheet_for_assessor',
      method: 'get',
    }).then((response) => {
      const rows = (response as Record<string, string>) || {}
      setDatasheetRowsData(rows)
    })
  }, [campaignId, userId])

  const userData = getResource(userId)
  const localeLabel = userData?.userProfile?.locale
    ? I18n.t(`languages.${userData.userProfile.locale}`)
    : EMPTY_VALUE
  const datasheetItems = useMemo(
    () => Object.entries(datasheetRowsData),
    [datasheetRowsData],
  )

  const loading = isLoading('fetch')

  return (
    <Flex className="h-100" vertical>
      {header(I18n.t('admin.profile'))}
      <div className={cs(styles.content, 'p-6')}>
        {loading ? <Skeleton active /> : (
          <>
            <Card style={{ background: token.colorBgLayout }}>
              <div className="p-6">
                <Flex align="center" gap={16} className="mb-4">
                  <div>
                    <Avatar
                      shape="square"
                      size={68}
                      src={userData?.userProfile?.photoUrl || undefined}
                      icon={<UserOutlined />}
                    />
                  </div>
                  <Flex vertical gap={4}>
                    <Typography.Title level={4} className="mb-0">
                      {userData?.name || EMPTY_VALUE}
                    </Typography.Title>
                    <Typography.Text type="secondary">
                      {userData?.email || EMPTY_VALUE}
                    </Typography.Text>
                    <Typography.Text>{localeLabel}</Typography.Text>
                  </Flex>
                </Flex>

              </div>
            </Card>

            <Card className="mt-5">
              <div className={cs(styles.datasheetGrid, 'p-6')}>
                {datasheetItems.length === 0 ? (
                  <Flex align="center" justify="center" className="p-4">
                    <Empty description={I18n.t('shared.no_data_found')} />
                  </Flex>
                ) : datasheetItems.map(([label, value]) => (
                  <Flex vertical gap={4} key={label}>
                    <Typography.Text type="secondary" className="transform-capitalize">{label}</Typography.Text>
                    <Typography.Text strong>{value || EMPTY_VALUE}</Typography.Text>
                  </Flex>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </Flex>
  )
}
