import { Tag, TagProps } from 'antd'
import { PlanChangeStatus, ChangeStatusColors } from '../../../core/idp/utils'

const { I18n } = window
export const ChangeStatus = ({ status, ...rest }:
   TagProps &{status: PlanChangeStatus}) => (
     <Tag {...rest} color={ChangeStatusColors[status]}>
       {I18n.t(`shared.${status.toLowerCase()}`)}
     </Tag>
)
