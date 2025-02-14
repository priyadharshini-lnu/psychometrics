import { FC } from 'react'
import Icon from '@ant-design/icons'
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon'

const Svg: FC<CustomIconComponentProps> = () => (
  /* eslint-disable max-len */
  <svg id="Rating_Your_Skills" data-name="Rating Your Skills" xmlns="http://www.w3.org/2000/svg" width="33.095" height="33.134" viewBox="0 0 33.095 33.134">
    <path id="Path_12281" data-name="Path 12281" d="M59.153,70.7H50.106l-3.65-9.163a1.005,1.005,0,0,0-1.786,0L41.021,70.7H31.974a.961.961,0,0,0-.679,1.65l7.3,7.319-3.63,9.169a.974.974,0,0,0,1.4,1.2l9.2-5.533,9.2,5.533a.974.974,0,0,0,1.4-1.2l-3.63-9.17,7.3-7.319A.961.961,0,0,0,59.153,70.7Z" transform="translate(-29.014 -57.049)" fill="#2eb5b8" />
    <path id="Path_12282" data-name="Path 12282" d="M270.3,72.354,263,79.673l3.63,9.17a.974.974,0,0,1-1.4,1.2l-9.2-5.533V61a.966.966,0,0,1,.893.544l3.65,9.163h9.047A.961.961,0,0,1,270.3,72.354Z" transform="translate(-239.483 -57.05)" fill="#dddede" />
    <path id="Path_12283" data-name="Path 12283" d="M321.672,11.918l-.967-3.11-3.11-.967a.972.972,0,0,1-.272-1.72L319.9,4.241V.984a1,1,0,0,1,1.586-.8l2.78,2.03,2.991-1.044a.972.972,0,0,1,1.23,1.252l-1.1,3,1.938,2.6a.98.98,0,0,1-.791,1.565h-3.257l-1.881,2.6A.972.972,0,0,1,321.672,11.918Z" transform="translate(-296.424 0)" fill="#a1d6d4" />
    <path id="Path_12284" data-name="Path 12284" d="M6.421,12.477l-1.8-2.632H1.284A.957.957,0,0,1,.493,8.309l1.939-2.6-1.1-3A.971.971,0,0,1,1.547,1.7a.983.983,0,0,1,1.011-.236L5.549,2.505,8.33.475a.961.961,0,0,1,1.529.8V4.528L12.49,6.409a.972.972,0,0,1-.272,1.72L9.108,9.1l-.967,3.11A.972.972,0,0,1,6.421,12.477Z" transform="translate(-0.297 -0.269)" fill="#a1d6d4" />
  </svg>
)

export const RateSkillIcon = (props) => {
  const { style, height, width } = props
  return (
    <Icon
      component={Svg}
      {...props}
      style={{
        height: height || '1.5em',
        width: width || '1.5em',
        ...style,
      }}
    />
  )
}
