import { FC } from 'react'
import Icon from '@ant-design/icons'
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon'

const Svg: FC<CustomIconComponentProps> = () => (
  /* eslint-disable max-len */
  <svg xmlns="http://www.w3.org/2000/svg" width="25.001" height="24.998" viewBox="0 0 25.001 24.998">
    <path id="Assessor_Evaluations" data-name="Assessor Evaluations" d="M12409,118h-19a3,3,0,0,1-3-3V96a3,3,0,0,1,3-3h19a3,3,0,0,1,3,3v19A3,3,0,0,1,12409,118Zm-16.406-8.617a.924.924,0,0,0-.651,1.586l.929.931a.907.907,0,0,0,.66.271.933.933,0,0,0,.657-.271l2.794-2.794a.938.938,0,0,0,0-1.318.956.956,0,0,0-.663-.269.924.924,0,0,0-.654.269l-2.134,2.137-.274-.274A.955.955,0,0,0,12392.594,109.383Zm7.295-.005a.931.931,0,0,0,0,1.863h6.517a.931.931,0,1,0,0-1.863Zm-7.295-8.688a.941.941,0,0,0-.932.931.9.9,0,0,0,.28.654l.929.931a.9.9,0,0,0,.66.274.924.924,0,0,0,.657-.274l2.794-2.791a.938.938,0,0,0,0-1.318.954.954,0,0,0-.663-.271.92.92,0,0,0-.654.271l-2.134,2.137-.274-.274A.95.95,0,0,0,12392.594,100.689Zm7.295,0a.931.931,0,0,0,0,1.863h6.517a.931.931,0,1,0,0-1.863Z" transform="translate(-12386.999 -93.001)" fill="#fe0000" />
  </svg>
)

export const AssessorEvaluationsIcon = props => (
  <Icon component={Svg} {...props} />
)
