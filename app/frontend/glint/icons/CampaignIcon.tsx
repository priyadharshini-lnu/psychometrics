import { FC } from 'react'
import Icon from '@ant-design/icons'
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon'

const Svg: FC<CustomIconComponentProps> = () => (
  /* eslint-disable max-len */
  <svg xmlns="http://www.w3.org/2000/svg" width="18.651" height="15.727" viewBox="0 0 18.651 15.727">
    <path id="Campaign" d="M15.259,4.158H7.367A2.367,2.367,0,0,0,5,6.525v10.2a2.367,2.367,0,0,0,2.367,2.367H17.627a2.367,2.367,0,0,0,2.367-2.367V13.565a.789.789,0,1,0-1.578,0v3.157a.789.789,0,0,1-.789.789H7.431a.781.781,0,0,1-.781-.789V6.517a.789.789,0,0,1,.789-.789h7.821a.789.789,0,1,0,0-1.578ZM12.308,7.946A2.45,2.45,0,1,0,8.843,11.41c.939.939,2.249,2.241,3.157,3.157a2.486,2.486,0,0,0,3.433.079l6.929-6.368a2.454,2.454,0,0,0,.789-1.76,2.51,2.51,0,0,0-.726-1.8,2.454,2.454,0,0,0-3.37-.095L13.72,9.358ZM11.195,9.035,13.16,11a.789.789,0,0,0,1.073,0L20.12,5.76a.892.892,0,0,1,1.215.039.887.887,0,0,1-.024,1.294L14.375,13.47a.908.908,0,0,1-1.255,0L9.964,10.313A.892.892,0,0,1,9.7,9.69a.882.882,0,0,1,1.507-.624Z" transform="translate(-4.75 -3.611)" fill="#141414" stroke="#fff" strokeWidth="0.5" fillRule="evenodd" />
  </svg>
)

export const CampaignIcon = props => (
  <Icon component={Svg} {...props} />
)
