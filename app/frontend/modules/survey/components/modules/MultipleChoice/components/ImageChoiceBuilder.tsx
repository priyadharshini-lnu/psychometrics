import { FC } from 'react'
import { Avatar } from 'antd'
import { PictureOutlined, StopOutlined } from '@ant-design/icons'

import { BuilderModel } from '~/modules/survey/interfaces/questions/MultipleChoice'

interface Props {
  src: BuilderModel['props']['choicesImages'][0] | null
  index: number
  onClick(index: number): void
}

export const ImageChoiceBuilder: FC<Props> = ({ index, src, onClick }) => (
  <span onClick={() => onClick(index)}>
    <Avatar
      src={src || null}
      icon={src ? null : <PictureOutlined />}
      gap={16}
      shape="square"
      size="small"
    />
  </span>
)

export const NotApplicableImageChoice: FC = () => (
  <Avatar
    icon={<StopOutlined />}
    gap={16}
    shape="square"
    size="small"
    className="cursor-default"
  />
)
