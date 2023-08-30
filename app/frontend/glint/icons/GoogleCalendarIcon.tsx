import { FC } from 'react'
import Icon from '@ant-design/icons'
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon'

const Svg: FC<CustomIconComponentProps> = () => (
  /* eslint-disable max-len */
  <svg id="google-calendar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17.131 17.131">
    <path id="Path_15_" d="M156.386,181.651a1.743,1.743,0,0,1-.7-1l.782-.322a1.187,1.187,0,0,0,.372.629.958.958,0,0,0,.64.222.987.987,0,0,0,.659-.233.745.745,0,0,0,.276-.594.737.737,0,0,0-.291-.6,1.128,1.128,0,0,0-.728-.233h-.452v-.774h.406a.989.989,0,0,0,.632-.2.669.669,0,0,0,.257-.556.614.614,0,0,0-.23-.5.891.891,0,0,0-.583-.188.783.783,0,0,0-.548.184,1.078,1.078,0,0,0-.3.452l-.774-.322a1.719,1.719,0,0,1,.567-.77,1.635,1.635,0,0,1,1.057-.334,1.928,1.928,0,0,1,.854.184,1.462,1.462,0,0,1,.594.509,1.3,1.3,0,0,1,.214.731,1.2,1.2,0,0,1-.2.7,1.375,1.375,0,0,1-.49.441v.046a1.489,1.489,0,0,1,.629.49,1.285,1.285,0,0,1,.246.789,1.476,1.476,0,0,1-.233.82,1.616,1.616,0,0,1-.644.567,2.029,2.029,0,0,1-.923.207A1.911,1.911,0,0,1,156.386,181.651Z" transform="translate(-150.479 -170.599)" fill="#0085f7" />
    <path id="Path_14_" d="M282.922,181.319l-.859.621-.429-.651,1.541-1.111h.591v5.242h-.843Z" transform="translate(-272.211 -174.149)" fill="#0085f7" />
    <path id="Path_3_" d="M93,390.737H83.98l-1.291,1.9,1.291,2.156H93l1.066-2.293Z" transform="translate(-79.922 -377.663)" fill="#00a94b" />
    <path id="Path_4_" d="M13.074,0H1.352A1.352,1.352,0,0,0,0,1.352V13.074l2.029,1.442,2.029-1.442V4.057h9.016l1.388-2.029Z" transform="translate(0 0)" fill="#0085f7" />
    <path id="Path_5_" d="M0,390.737v2.7a1.352,1.352,0,0,0,1.352,1.352h2.7v-4.057Z" transform="translate(0 -377.663)" fill="#00802e" />
    <path id="Path_6_" d="M394.794,83.554l-2.029-1.305-2.029,1.305v9.016l1.824.952,2.233-.952Z" transform="translate(-377.663 -79.497)" fill="#ffbc00" />
    <path id="Path_2_" d="M394.794,4.057v-2.7A1.352,1.352,0,0,0,393.442,0h-2.7V4.057Z" transform="translate(-377.663 0)" fill="#0067d5" />
    <path id="Path_1_" d="M390.737,394.794l4.057-4.057h-4.057Z" transform="translate(-377.663 -377.663)" fill="#ff4131" />
  </svg>
)

export const GoogleCalendarIcon = (props) => {
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
