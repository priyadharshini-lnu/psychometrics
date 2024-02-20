import { FC } from 'react'
import Icon from '@ant-design/icons'
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon'

const Svg: FC<CustomIconComponentProps> = () => (
  /* eslint-disable max-len */
  <svg xmlns="http://www.w3.org/2000/svg" width="31.988" height="20.571" viewBox="0 0 31.988 20.571">
    <path id="Overall_Scores" data-name="Overall Scores" d="M12399.246,109.821a3.734,3.734,0,0,1,1.732-3.162l8.134-5.188a.937.937,0,0,1,1.355,1.184l-4.075,8.745a3.748,3.748,0,0,1-7.146-1.58Zm13.118,0a.936.936,0,0,1-.935-.937,8.157,8.157,0,0,0-.5-2.792l1.23-2.645a2.8,2.8,0,0,0-.035-2.376l2.756-2.754a15.918,15.918,0,0,1,4.1,10.567.938.938,0,0,1-.937.937Zm-24.427,0a.938.938,0,0,1-.937-.937,15.9,15.9,0,0,1,4.1-10.567l5.331,5.331a8.351,8.351,0,0,0-1.874,5.235.937.937,0,0,1-.937.937Zm4.49-12.829a15.856,15.856,0,0,1,9.63-3.993v7.546a8.33,8.33,0,0,0-4.3,1.779Zm11.5,3.552V93a15.861,15.861,0,0,1,9.629,3.993l-2.755,2.756a2.675,2.675,0,0,0-2.7.141l-1.932,1.23A8.421,8.421,0,0,0,12403.932,100.544Z" transform="translate(-12387 -92.999)" fill="#009c37" />
  </svg>
)

export const OverallScoresIcon = props => (
  <Icon component={Svg} {...props} />
)
