import { FC } from 'react'
import Icon from '@ant-design/icons'
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon'

const Svg: FC<CustomIconComponentProps> = () => (
  /* eslint-disable max-len */
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17.516 17.515">
    <path id="ical" d="M18488.051,9007.273a2.056,2.056,0,0,1-2.051-2.053v-12.044a2.055,2.055,0,0,1,2.051-2.05h.824v-1.368h1.367v1.368h9.031v-1.368h1.367v1.368h.82a2.056,2.056,0,0,1,2.055,2.05v12.044a2.057,2.057,0,0,1-2.055,2.053Zm-.684-2.053a.686.686,0,0,0,.684.686h13.41a.689.689,0,0,0,.688-.686v-9.033h-14.781Zm0-12.044v1.643h14.781v-1.643a.688.688,0,0,0-.687-.682h-.82v1.368h-1.367V8992.5h-9.031v1.368h-1.367V8992.5h-.824A.685.685,0,0,0,18487.367,8993.177Zm9.453,11.517v-1.371h1.371v1.371Zm-2.75,0v-1.371h1.371v1.371Zm-2.742,0v-1.371h1.371v1.371Zm-2.746,0v-1.371h1.371v1.371Zm10.98-2.745v-1.371h1.375v1.371Zm-2.742,0v-1.371h1.371v1.371Zm-2.75,0v-1.371h1.371v1.371Zm-2.742,0v-1.371h1.371v1.371Zm-2.746,0v-1.371h1.371v1.371Zm10.98-2.746v-1.372h1.375v1.372Zm-2.742,0v-1.372h1.371v1.372Zm-2.75,0v-1.372h1.371v1.372Zm-2.742,0v-1.372h1.371v1.372Zm-2.746,0v-1.372h1.371v1.372Z" transform="translate(-18486 -8989.759)" />
  </svg>
)

export const IcalIcon = (props) => {
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
