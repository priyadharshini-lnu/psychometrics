import { FC } from 'react'
import Icon from '@ant-design/icons'
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon'

const Svg: FC<CustomIconComponentProps> = () => (
  /* eslint-disable max-len */
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13.937 16.722">
    <path id="office365" d="M56.325,1.407,51.447.014a.348.348,0,0,0-.23.013L42.856,3.511a.348.348,0,0,0-.214.321V12.89a.348.348,0,0,0,.345.348.348.348,0,0,0-.107.679L51.242,16.7a.359.359,0,0,0,.11.017.349.349,0,0,0,.1-.014l4.877-1.394a.348.348,0,0,0,.253-.334V1.742A.348.348,0,0,0,56.325,1.407ZM43.147,13.2l2.09-1.045a.348.348,0,0,0,.192-.311V4.453L51.7,2.885V14.574l-8.657-1.332a.3.3,0,0,0-.049,0A.353.353,0,0,0,43.147,13.2Z" transform="translate(-42.641 0)" fill="#ff5722" />
  </svg>
)

export const Office365Icon = (props) => {
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
