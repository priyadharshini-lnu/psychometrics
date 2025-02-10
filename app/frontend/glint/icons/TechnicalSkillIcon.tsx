import { FC } from 'react'
import Icon from '@ant-design/icons'
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon'

const Svg: FC<CustomIconComponentProps> = () => (
  /* eslint-disable max-len */
  <svg id="Exploring_Your_Technical_Skills" data-name="Exploring Your Technical Skills" xmlns="http://www.w3.org/2000/svg" width="56.764" height="56.764" viewBox="0 0 56.764 56.764">
    <circle id="Ellipse_2378" data-name="Ellipse 2378" cx="28.382" cy="28.382" r="28.382" fill="#232323" />
    <g id="Layer_x0020_1" transform="translate(10.492 9.161)">
      <g id="_450982968" transform="translate(0)">
        <path id="Path_12217" data-name="Path 12217" d="M78.894,38.442H74.638a.922.922,0,0,1-.991-.608l-1.036-5.09a14.107,14.107,0,0,1-5.472-3.175l-4.932,1.644a.977.977,0,0,1-1.036-.54l-2.117-3.693a.93.93,0,0,1,.023-1.149l3.9-3.446a14.072,14.072,0,0,1,0-6.328l-3.9-3.446a.96.96,0,0,1-.023-1.171l2.117-3.671a.953.953,0,0,1,1.036-.563L67.139,8.85A14.057,14.057,0,0,1,72.611,5.7L73.647.608C73.715.225,74.12,0,74.638,0h4.256a.893.893,0,0,1,.968.608L80.921,5.7A14.057,14.057,0,0,1,86.393,8.85l4.932-1.644a.926.926,0,0,1,1.013.563l2.117,3.671c.27.473.27.923-.023,1.171L90.56,16.057a14.988,14.988,0,0,1,0,6.328l3.873,3.446a.873.873,0,0,1,.023,1.149l-2.117,3.693a.935.935,0,0,1-1.013.54l-4.932-1.644a14.107,14.107,0,0,1-5.472,3.175l-1.058,5.09A.893.893,0,0,1,78.894,38.442Zm-2.139-9.256a9.965,9.965,0,1,1,9.976-9.976A9.976,9.976,0,0,1,76.755,29.186Z" transform="translate(-58.871 0)" fill="#fff" fillRule="evenodd" />
        <path id="Path_12218" data-name="Path 12218" d="M631.112,663.966a9.49,9.49,0,0,1-2.252-.27.454.454,0,0,1-.36-.428v-6.4a5.143,5.143,0,0,1,.248-8.963.459.459,0,0,1,.45.023.442.442,0,0,1,.2.383v3.694h3.423v-3.694a.464.464,0,0,1,.225-.383.456.456,0,0,1,.45-.023,5.132,5.132,0,0,1,.225,8.963v6.4a.434.434,0,0,1-.338.428A9.679,9.679,0,0,1,631.112,663.966Z" transform="translate(-613.228 -633.272)" fill="#fff" fillRule="evenodd" />
        <path id="Path_12219" data-name="Path 12219" d="M686.409,531.9h-6.959a.45.45,0,1,1,0-.9h6.959a.45.45,0,0,1,0,.9Z" transform="translate(-665.034 -519.042)" fill="#fff" fillRule="evenodd" />
      </g>
    </g>
  </svg>

)

export const TechnicalSkillIcon = (props) => {
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
