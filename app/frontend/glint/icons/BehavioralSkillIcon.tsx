import { FC } from 'react'
import Icon from '@ant-design/icons'
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon'

const Svg: FC<CustomIconComponentProps> = () => (
  /* eslint-disable max-len */
  <svg id="Exploring_Your_Behavioral_Skills" data-name="Exploring Your Behavioral Skills" xmlns="http://www.w3.org/2000/svg" width="56.764" height="56.764" viewBox="0 0 56.764 56.764">
    <circle id="Ellipse_2377" data-name="Ellipse 2377" cx="28.382" cy="28.382" r="28.382" fill="#009ea7" />
    <g id="refresh-user-sign" transform="translate(5.947 6.073)">
      <path id="Path_12216" data-name="Path 12216" d="M22.21,24.16a5.718,5.718,0,1,1,5.7-5.717A5.711,5.711,0,0,1,22.21,24.16Zm-8.874,8.259v2.541H31.084V32.418a6.345,6.345,0,0,0-6.338-6.353H19.675A6.345,6.345,0,0,0,13.336,32.418Zm28.52-18.744A22.24,22.24,0,0,0,1.924,14.962a1.639,1.639,0,1,0,2.985,1.355,18.971,18.971,0,0,1,33.959-1.285l-2.921,1.326,7.966,5.722.962-9.776ZM41.4,31.909a1.637,1.637,0,0,0-2.2.736A18.969,18.969,0,0,1,5.9,33.9l2.87-1.435L.6,27.046,0,36.852,2.964,35.37a22.24,22.24,0,0,0,39.172-1.258A1.642,1.642,0,0,0,41.4,31.909Z" transform="translate(0 -1.85)" fill="#fff" />
    </g>
  </svg>

)

export const BehavioralSkillIcon = (props) => {
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
