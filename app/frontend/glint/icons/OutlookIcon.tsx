import { FC } from 'react'
import Icon from '@ant-design/icons'
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon'

const Svg: FC<CustomIconComponentProps> = () => (
  /* eslint-disable max-len */
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.652 17.487">
    <g id="outlook" transform="translate(0 -15.989)">
      <path id="Path_12200" data-name="Path 12200" d="M264.743,112.011h-8.16a.583.583,0,1,0,0,1.166h6.462l-3.581,2.785-2.568-1.633-.625.984,2.914,1.854a.583.583,0,0,0,.67-.031l4.305-3.349v7.552h-7.577a.583.583,0,1,0,0,1.166h8.16a.583.583,0,0,0,.583-.583v-9.326A.583.583,0,0,0,264.743,112.011Z" transform="translate(-246.674 -92.524)" fill="#1976d2" />
      <path id="Path_12201" data-name="Path 12201" d="M10.281,16.124A.573.573,0,0,0,9.8,16L.476,17.749A.581.581,0,0,0,0,18.322V31.145a.582.582,0,0,0,.476.572L9.8,33.466a.549.549,0,0,0,.107.01.583.583,0,0,0,.583-.583V16.573A.581.581,0,0,0,10.281,16.124Z" transform="translate(0 0)" fill="#2196f3" />
      <path id="Path_12202" data-name="Path 12202" d="M66.914,183.005a3.556,3.556,0,1,1,2.914-3.5A3.25,3.25,0,0,1,66.914,183.005Zm0-5.829c-.964,0-1.749,1.046-1.749,2.331s.785,2.331,1.749,2.331,1.749-1.046,1.749-2.331S67.878,177.177,66.914,177.177Z" transform="translate(-61.669 -154.192)" fill="#fafafa" />
    </g>
  </svg>
)

export const OutlookIcon = (props) => {
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
