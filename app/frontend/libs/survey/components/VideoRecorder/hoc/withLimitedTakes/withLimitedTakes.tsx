import React, { useState, useEffect } from 'react'
import { Button, Space } from 'antd'
import cs from 'classnames'
import _ from 'lodash'
import axios from 'axios'
import { CheckOutlined } from '@ant-design/icons'
import styles from './styles.scss'
import ColoredButton from 'components/ColoredButton'
import RecordButton from 'components/AudioRecorder/MediaButtons/RecordButton'

const withLimitedTakes = (WrappedComponent, { maxTakes }) => (props) => {
  const { onSuccessUpload, model, model: { result }, inProgressQuestions } = props
  const [currentTakeNo, setCurrentTakeNo] = useState(1)
  const [recordingAllowed, setRecordingAllowed] = useState(false)
  const completedTakes = result.answers.length
  const currentTakeDetails = _.find(result.answers, ({ take_no }) => take_no === currentTakeNo)
  const showRetakes = completedTakes > 0 && completedTakes < maxTakes && currentTakeDetails
  const recordingInProgress = _.find(inProgressQuestions || [], ({ questionId }) => questionId === model.id)

  useEffect(() => {
    const selectedTake = _.find(result.answers, ({ user_selected }) => user_selected)
    const currentTakeNo = selectedTake ? selectedTake.take_no : 1
    setCurrentTakeNo(currentTakeNo)
  }, [])

  const handleAllowRecording = () => {
    setRecordingAllowed(true)
  }

  const handleOnSuccessUpload = (data) => {
    onSuccessUpload && onSuccessUpload({ ...data, takeNo: currentTakeNo })
    if (maxTakes === 1 || currentTakeNo === 1) { handleUserSelectedTake() }
  }

  const handleUserSelectedTake = () => {
    const { mediaUrl, saveCurrentPage } = props
    result.moduleResult.userSelectedTake(currentTakeNo)
    setTimeout(() => saveCurrentPage(), 200)
    axios.put(`${mediaUrl}/user_selected_take`, { take_no: currentTakeNo })
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

  const currentTakeIsSelected = currentTakeDetails && currentTakeDetails.user_selected

  return (
    <div>
      {renderWrappedComponent()}
      {!recordingInProgress && <div className={styles.retakeContainer}>
        <div>
          <TakeButtons maxTakes={maxTakes} currentTakeNo={currentTakeNo} result={result} onChangeTake={setCurrentTakeNo}  />
        </div>
        <div className='text-align-c'>
          {showRetakes && <div onClick={() => setCurrentTakeNo(completedTakes + 1)} className={styles.retakeBtn}>
            <RecordButton className={styles.recordBtnContainer} recordButtonClass={styles.recordBtn}/>
            Retake
          </div>}
        </div>
        <div className='text-align-r'>
          {completedTakes > 1 && !currentTakeIsSelected &&
            <ColoredButton type="primary" className={styles.allowButton} color="green" onClick={handleUserSelectedTake}>
              <CheckOutlined />
              Use This
            </ColoredButton>}
          {completedTakes > 1 && currentTakeIsSelected &&
            <div className={styles.inUse}><CheckOutlined /> In Use</div>}
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
