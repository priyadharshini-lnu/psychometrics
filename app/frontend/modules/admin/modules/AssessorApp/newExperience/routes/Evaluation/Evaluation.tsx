import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Flex, Button, useGlintToken } from '@thetalententerprise/glint'
import { CloseOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import LegacyEvaluation from '~/modules/admin/modules/AssessorApp/routes/Evaluation'
import styles from './Evaluation.less'

const { I18n } = window

const Evaluation: React.FC = () => {
  const navigate = useNavigate()
  const { campaignId, userId } = useParams<{ campaignId?: string, userId?: string }>()
  const token = useGlintToken()

  return (
    <Flex vertical style={{ background: token.colorBgLayout }} className={styles.pageRoot}>
      <div className={`${styles.stickyHeader} pt-4 pb-4 ps-6 pe-6`}>
        <Flex align="center" justify="flex-end">
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
