import {
  Card, Avatar, Flex, Skeleton, Button,
} from 'antd'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import _ from 'lodash'
import { UserOutlined, CloseOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import styles from './styles.less'
import { useResources } from '~/hooks/useResources'
import { User, UserProfile } from '~/modules/admin/modules/campaigns/core/user'

const { I18n } = window
interface Subject extends User{
  userProfile: UserProfile,
}

type ProfileCardProps = {
    name?: string;
    email?: string;
    age?: number | null;
    gender?: string | null;
    locale?: string | null;
    rows?: Record<string, string>
    photoUrl?: string | null;
  onClose?: () => void;
}

const ProfileCard = ({
  name, photoUrl, email, gender, locale, rows, age, onClose,
}:ProfileCardProps) => (
  <Card
    className={styles.profileCard}
    cover={(
      <Flex>
        <Flex vertical align="center" justify="center" gap={8} className={styles.cardCover}>
          <Button type="text" className={styles.closeBtn} onClick={onClose} icon={<CloseOutlined />} />
          <Avatar shape="square" size={116} src={photoUrl} icon={<UserOutlined />} />
          <Flex vertical align="center" gap={8}>
            <Flex vertical align="center">
              <span className={styles.userName}>{name}</span>
              <span>{email}</span>
            </Flex>
            <span>
              {age ? `${age} ${I18n.t('admin.scoring_profile_years')}, ` : null}
              {gender ? `${gender}, ` : null}
              {locale ? I18n.t(`languages.${locale}`) : null}
            </span>
          </Flex>
        </Flex>
      </Flex>
    )}
  >
    <Flex vertical align="flex-start" className={styles.roleSection}>
      {_.map(rows, (value, key) => (
        <>
          <span className={styles.roleLabel}>{key}</span>
          <span className={styles.roleValue}>{value}</span>
        </>
      ))}
    </Flex>
  </Card>
)

export default ProfileCard

export const Profile = ({ header, onClose }) => {
  const { campaignId, userId } = useParams() as { campaignId: string, userId: string }
  const [datasheetRowsData, setDatasheetRowsData] = useState<Record<string, string>>()

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
    }).then((response:Record<string, string>) => {
      setDatasheetRowsData(response)
    })
  }, [userId])

  const userData = getResource(userId)
  return (
    <div className={styles.sidebar}>
      {header}
      {isLoading('fetch') ? <Skeleton active /> : (
        <ProfileCard
          name={userData?.name}
          email={userData?.email}
          age={userData?.userProfile.age}
          gender={userData?.userProfile.gender}
          locale={userData?.userProfile.locale}
          rows={datasheetRowsData}
          photoUrl={userData?.userProfile?.photoUrl}
          onClose={onClose}
        />
      )
        }
      {isLoading('fetch') ? <Skeleton active /> : null}

    </div>
  )
}
