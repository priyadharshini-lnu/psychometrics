import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Flex, Button, useGlintToken, Typography,
} from '@thetalententerprise/glint'
import { CloseOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/admin/core/rootReducers'
import LegacyEvaluation from '~/modules/admin/modules/AssessorApp/routes/Evaluation'
import { CandidateAvatar } from '../../components/CandidateAvatar'
import styles from './Evaluation.less'

const { I18n } = window

const Evaluation: React.FC = () => {
  const navigate = useNavigate()
  const { campaignId, userId } = useParams<{ campaignId?: string, userId?: string }>()
  const token = useGlintToken()
  const loadedUserId = useSelector((state: RootState) => state.assessors.evaluation.userId)
  const user = useSelector((state: RootState) => state.assessors.evaluation.userInfo.user)
  const isCurrentUserLoaded = loadedUserId === Number(userId)

  return (
    <Flex vertical style={{ background: token.colorBgLayout }} className={styles.pageRoot}>
      <div className={`${styles.stickyHeader} pt-4 pb-4 ps-6 pe-6`}>
        <Flex align="center" justify="space-between">
          {isCurrentUserLoaded && user && (
            <Flex align="center" gap={12}>
              <CandidateAvatar name={`${user.first_name} ${user.last_name}`} size={48} />
              <Flex vertical>
                <Typography.Title level={3} className="mb-0">
                  {`${user.first_name} ${user.last_name}`}
                </Typography.Title>
                <Typography.Text type="secondary" className="font-normal">
                  {user.email}
                </Typography.Text>
              </Flex>
            </Flex>
          )}
          <Button
            variant="outlined"
            icon={<CloseOutlined />}
            onClick={() => navigate(`/assessors/evaluation/campaigns/${campaignId}/users/${userId}`)}
          >
            {I18n.t('shared.close')}
          </Button>
        </Flex>
      </div>
      <div className={styles.body}>
        <LegacyEvaluation />
      </div>
    </Flex>
  )
}

export default Evaluation
