import { FC } from 'react'
import Icon from '@ant-design/icons'
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon'

const Svg: FC<CustomIconComponentProps> = () => (
  /* eslint-disable max-len */
  <svg xmlns="http://www.w3.org/2000/svg" width="56.764" height="56.764" viewBox="0 0 56.764 56.764">
    <g id="Other" transform="translate(0.339 0.145)">
      <circle id="Ellipse_2379" data-name="Ellipse 2379" cx="28.382" cy="28.382" r="28.382" transform="translate(-0.339 -0.145)" fill="#cb4525" />
      <g id="_x30_8" transform="translate(10 3) scale(2.27)">
        <path id="Path_12221" data-name="Path_12221" d="M2,12l5.677,3.206V21.35L2.658,18.4A1.336,1.336,0,0,1,2,17.247Z" transform="translate(0 -3.755)" fill="#fff" />
        <path id="Path_12223" data-name="Path_12223" d="M17.177,12,11.5,15.206V21.35L16.518,18.4a1.336,1.336,0,0,0,.658-1.151Z" transform="translate(-3.155 -3.755)" fill="#fff" />
        <path id="Path_12225" data-name="Path_12225" d="M2,9.339l6.011,3.339,6.011-3.339L8.659,6.173a1.3,1.3,0,0,0-1.3,0Z" transform="translate(0 -1.763)" fill="#fff" />
      </g>
    </g>
  </svg>
)

export const OtherSkillIcon = (props) => {
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
