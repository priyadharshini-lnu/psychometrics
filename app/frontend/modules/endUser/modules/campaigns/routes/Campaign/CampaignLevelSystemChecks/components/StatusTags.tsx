import {
  Tag, TagProps,
} from 'antd'
import {
  CheckCircleOutlined, CloseCircleOutlined,
  SyncOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { CHECK_STATUS } from '../common'

export const SuccessTag = (props: TagProps) => (
  <Tag
    {...props}
    color="success"
    variant="outlined"
    icon={(
      <CheckCircleOutlined />
    )}
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
  >
    {CHECK_STATUS.pending}
  </Tag>
)
