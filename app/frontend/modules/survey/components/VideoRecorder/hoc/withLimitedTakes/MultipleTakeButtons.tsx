import React from 'react'
import _ from 'lodash'
import cs from 'classnames'
import { Button, Space } from 'antd'
import { MediaResponse } from 'modules/survey/core/preview/FlowProcessor/interfaces'
import styles from './styles.scss'

interface Props {
  maxTakes: number
  currentTakeIndex: number
  mediaResponses: MediaResponse[]
  onChangeTakeIndex(index: number): void
}

const MultipleTakeButtons: React.FC<Props> = ({
  maxTakes, currentTakeIndex, mediaResponses, onChangeTakeIndex,
}) => (
  <Space>
    {_.times(maxTakes, (index: number) => {
      const currentMediaResponse = mediaResponses[index]
      if (!currentMediaResponse && index !== currentTakeIndex) {
        return <Button key={index} className={styles.unusedTake} disabled>&nbsp;</Button>
      }
      return (
        <Button
          key={index}
          className={cs({ [styles.activeTakeBtn]: index === currentTakeIndex })}
          onClick={() => onChangeTakeIndex(index)}
        >
          {index + 1}
        </Button>
      )
    })}
  </Space>
)

export default MultipleTakeButtons
