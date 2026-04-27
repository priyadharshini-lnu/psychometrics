import {
  Tag, TagProps,
} from 'antd'
import {
  CheckCircleOutlined, CloseCircleOutlined,
  SyncOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { CHECK_STATUS } from '../common'

const { I18n } = window

export const SuccessTag = (props: TagProps) => (
  <Tag
    {...props}
    color="success"
    variant="outlined"
    icon={(
      <CheckCircleOutlined />
    )}
    role="status"
    aria-label={I18n.t('enduser.campaign_check_status', { status: I18n.t(`enduser.${CHECK_STATUS.passed}`) })}
  >
    {CHECK_STATUS.passed}
  </Tag>
)

export const FailureTag = (props: TagProps) => (
  <Tag
    {...props}
    color="error"
    variant="outlined"
    icon={(
      <CloseCircleOutlined />
    )}
    role="status"
    aria-label={I18n.t('enduser.campaign_check_status', { status: I18n.t(`enduser.${CHECK_STATUS.failed}`) })}
  >
    {CHECK_STATUS.failed}
  </Tag>
)

export const PendingTag = (props: TagProps) => (
  <Tag
    {...props}
    color="processing"
    variant="outlined"
    style={{ height: 'fit-content' }}
    icon={(
      <SyncOutlined />
                )}
    role="status"
    aria-label={I18n.t('enduser.campaign_check_status', { status: I18n.t(`enduser.${CHECK_STATUS.pending}`) })}
  >
    {CHECK_STATUS.pending}
  </Tag>
)
