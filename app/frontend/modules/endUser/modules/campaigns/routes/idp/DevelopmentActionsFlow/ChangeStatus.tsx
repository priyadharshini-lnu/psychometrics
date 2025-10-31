import { Tag, TagProps } from 'antd'
import { PlanChangeStatus, ChangeStatusColors } from '../../../core/idp/utils'

export const ChangeStatus = ({ status, ...rest }:
   TagProps &{status: PlanChangeStatus}) => (
     <Tag {...rest} color={ChangeStatusColors[status]}>
       {status}
     </Tag>
)
