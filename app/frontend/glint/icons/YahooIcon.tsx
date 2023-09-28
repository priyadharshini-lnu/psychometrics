import { FC } from 'react'
import Icon from '@ant-design/icons'
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon'

const Svg: FC<CustomIconComponentProps> = () => (
  /* eslint-disable max-len */
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15.316 14.246">
    <path id="Yahoo" d="M18410.76,9004.006a.336.336,0,0,1-.314-.463l.828-2.058-3.246-7.976a.339.339,0,0,1,.314-.467h2.4a.339.339,0,0,1,.318.217l1.734,4.443,1.8-4.447a.336.336,0,0,1,.314-.213h2.336a.339.339,0,0,1,.314.467l-4.162,10.283a.337.337,0,0,1-.314.213Zm5.715-4.568a1.889,1.889,0,1,1,1.891,1.891A1.889,1.889,0,0,1,18416.475,8999.438Zm1.7-2.922a.341.341,0,0,1-.314-.468l2.465-6.08a.339.339,0,0,1,.314-.208h2.334a.335.335,0,0,1,.314.463l-2.469,6.08a.337.337,0,0,1-.314.213Z" transform="translate(-18408 -8989.76)" fill="#6001d1" />
  </svg>
)

export const YahooIcon = (props) => {
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
