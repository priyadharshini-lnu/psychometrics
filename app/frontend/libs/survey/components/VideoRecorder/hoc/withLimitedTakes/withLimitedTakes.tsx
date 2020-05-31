import React, { useState, useEffect } from 'react'
import { Button, Space } from 'antd'
import cs from 'classnames'
import _ from 'lodash'
import axios from 'axios'
import { CheckOutlined } from '@ant-design/icons'
import styles from './styles.scss'
import ColoredButton from 'components/ColoredButton'

const withLimitedTakes = (WrappedComponent, { maxTakes }) => (props) => {
  const { onSuccessUpload, result, model, inProgressQuestions } = props
  const [currentTakeNo, setCurrentTakeNo] = useState(1)
  const [recordingAllowed, setRecordingAllowed] = useState(false)
  const completedTakes = result.answers.length
  const currentTakeDetails = _.find(result.answers, ({ take_no }) => take_no === currentTakeNo)
  const showRetakes = completedTakes > 0 && completedTakes < maxTakes && currentTakeDetails
  const recordingInProgress = _.find(inProgressQuestions || [], ({ questionId }) => questionId === model.id)

  console.log(currentTakeNo, result.answers)

  useEffect(() => {
    const selectedTake = _.find(result.answers, ({ userSelected }) => userSelected)
    const currentTakeNo = selectedTake ? selectedTake.takeNo : 1
    setCurrentTakeNo(currentTakeNo)
  }, [])

  const handleAllowRecording = () => {
    setRecordingAllowed(true)
  }

  const handleOnSuccessUpload = (data) => {
    onSuccessUpload && onSuccessUpload({ ...data, takeNo: currentTakeNo })
    if (maxTakes === 1) { handleUserSelectedTake() }
  }

  const handleUserSelectedTake = () => {
    const { mediaUrl } = props
    result.userSelectedTake(currentTakeNo)
    axios.post(`${mediaUrl}/user_selected_take`, { take_no: currentTakeNo })
  }

  const renderWrappedComponent = () => {
    return <WrappedComponent
      {...props}
      answer={currentTakeDetails}
      key={currentTakeNo}
      onSuccessUpload={handleOnSuccessUpload}
      disallowDiscard={true}
      recordingAllowed={recordingAllowed}
      onRecordingAllowed={handleAllowRecording} />
  }

  if (maxTakes === 1) {
    return renderWrappedComponent()
  }

  return (
    <div>
      {renderWrappedComponent()}
      {!recordingInProgress && <div className={styles.retakeContainer}>
        <div>
          <TakeButtons maxTakes={maxTakes} currentTakeNo={currentTakeNo} result={result} onChangeTake={setCurrentTakeNo}  />
        </div>
        <div className='text-align-c'>
          {showRetakes && <Button onClick={() => setCurrentTakeNo(completedTakes + 1)}>Retake</Button>}
        </div>
        <div className='text-align-r'>
          {completedTakes > 1 &&
            <ColoredButton type="primary" className={styles.allowButton} color="green" onClick={handleUserSelectedTake}>
              <CheckOutlined />
              Use This
            </ColoredButton>}
        </div>
      </div>}
    </div>
  )
}

function TakeButtons({ maxTakes, currentTakeNo, result, onChangeTake }) {
  return (
    <Space>
      {_.times(maxTakes, (index) => {
        const takeNo = index + 1
        const answer = _.find(result.answers, ({ take_no }) => take_no === takeNo)
        console.log(answer)
        if (!answer && takeNo !== currentTakeNo) {
          return <Button key={takeNo} className={styles.unusedTake} disabled>&nbsp;</Button>
        }
        return <Button
          key={takeNo}
          className={cs({ [styles.activeTakeBtn]: takeNo === currentTakeNo })}
          onClick={() => onChangeTake(takeNo)}>
          {takeNo}
        </Button>
      })}
    </Space>
  )
}

export default withLimitedTakes
