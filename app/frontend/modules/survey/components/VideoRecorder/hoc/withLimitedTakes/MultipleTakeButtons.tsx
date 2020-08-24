import React from 'react'
import _ from 'lodash'
import cs from 'classnames'
import { Button, Space } from 'antd'
import styles from './styles.scss'
import { Answer } from './withLimitedTakes'

interface Props {
  maxTakes: number
  currentTakeNo: number
  answers: Answer[]
  onChangeTake(takeNo: number): void
}

const MultipleTakeButtons: React.FC<Props> = ({
  maxTakes, currentTakeNo, answers, onChangeTake,
}) => (
  <Space>
    {_.times(maxTakes, (index: number) => {
      const takeNo = index + 1
      const answer = _.find(answers, ({ take_no }) => take_no === takeNo)
      if (!answer && takeNo !== currentTakeNo) {
        return <Button key={takeNo} className={styles.unusedTake} disabled>&nbsp;</Button>
      }
      return (
        <Button
          key={takeNo}
          className={cs({ [styles.activeTakeBtn]: takeNo === currentTakeNo })}
          onClick={() => onChangeTake(takeNo)}
        >
          {takeNo}
        </Button>
      )
    })}
  </Space>
)

export default MultipleTakeButtons
