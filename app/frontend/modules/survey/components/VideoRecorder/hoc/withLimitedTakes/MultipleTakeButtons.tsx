import React from 'react'
import _ from 'lodash'
import cs from 'classnames'
import { Radio } from 'antd'
import { MediaResponse } from 'modules/survey/core/preview/FlowProcessor/interfaces'
import styles from './styles.scss'

interface Props {
  maxTakes: number
  currentTakeIndex: number
  selectedTakeIndex: number
  mediaResponses: MediaResponse[]
  onChangeTakeIndex(index: number): void
}

const MultipleTakeButtons: React.FC<Props> = ({
  maxTakes, currentTakeIndex, selectedTakeIndex, mediaResponses, onChangeTakeIndex,
}) => (
  <Radio.Group className={styles.buttons} onChange={e => onChangeTakeIndex(e.target.value)}>
    {_.times(maxTakes, (index: number) => {
      const currentMediaResponse = mediaResponses[index]
      if (!currentMediaResponse && index !== currentTakeIndex) {
        return <Radio.Button key={index} className={styles.unusedTake} disabled>&nbsp;</Radio.Button>
      }
      return (
        <Radio.Button
          key={index}
          value={index}
          checked={index === currentTakeIndex}
          className={cs({
            [styles.selectedTakeBtn]: index === selectedTakeIndex,
          })}
        >
          {index + 1}
        </Radio.Button>
      )
    })}
  </Radio.Group>
)

export default MultipleTakeButtons
