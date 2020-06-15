import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import axios from 'axios'
import { CheckOutlined } from '@ant-design/icons'
import ColoredButton from 'components/ColoredButton'
import RecordButton from 'components/AudioRecorder/MediaButtons/RecordButton'
import { InProgressQuestion } from 'core/preview/FlowProcessor/interfaces'
import { I18n } from 'libs/survey/store/StoreWatchman'
import MultipleTakeButtons from './MultipleTakeButtons'
import styles from './styles.scss'

interface Props {
  onSuccessUpload(answer: Answer, { shouldSaveCurrentPage: boolean }): void
  saveCurrentPage(): void
  model: {
    id: number
    result: {
      answers: Answer[],
      moduleResult: {
        userSelectedTake(takeNo: number): void
      }
    }
  }
  inProgressQuestions: InProgressQuestion[]
  mediaUrl: string
}

export interface Answer {
  take_no: number
  user_selected: boolean
  media_id: number
}

const withLimitedTakes = (WrappedComponent, { maxTakes }: { maxTakes: number }) => (props: Props) => {
  const {
    onSuccessUpload, model, model: { result }, inProgressQuestions,
  } = props
  const [currentTakeNo, setCurrentTakeNo] = useState(1)
  const [recordingAllowed, setRecordingAllowed] = useState(false)

  const completedTakes = result.answers.length

  const currentTakeDetails: Answer = _.find(result.answers, ({ take_no }) => take_no === currentTakeNo)

  const showRetakes: boolean = completedTakes > 0 && completedTakes < maxTakes && !!currentTakeDetails

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
    onSuccessUpload
      && onSuccessUpload({ ...data, takeNo: currentTakeNo }, { shouldSaveCurrentPage: currentTakeNo !== 1 })

    // First take is always marked as user selected. User can change it after recording second video
    if (currentTakeNo === 1) { handleUserSelectedTake(data.id) }
  }

  const handleUserSelectedTake = (mediaId: number) => {
    const { mediaUrl, saveCurrentPage } = props
    result.moduleResult.userSelectedTake(currentTakeNo)
    setTimeout(() => saveCurrentPage(), 200)
    axios.put(
      `${mediaUrl}/mark_as_user_selected_take`,
      { take_no: currentTakeNo, media_id: mediaId },
      {
        headers: {
          'X-CSRF-Token': (document.querySelector('meta[name="csrf-token"]') as Element).getAttribute('content'),
        },
      },
    )
  }

  const renderWrappedComponent = () => (
    <WrappedComponent
      {...props}
      answer={currentTakeDetails}
      key={currentTakeNo}
      onSuccessUpload={handleOnSuccessUpload}
      disallowDiscard
      recordingAllowed={recordingAllowed}
      onRecordingAllowed={handleAllowRecording}
    />
  )

  if (maxTakes === 1) {
    return renderWrappedComponent()
  }

  const currentTakeIsSelected = currentTakeDetails && currentTakeDetails.user_selected

  return (
    <div>
      {renderWrappedComponent()}
      {!recordingInProgress && (
      <div className={styles.retakeContainer}>
        <div>
          <MultipleTakeButtons
            maxTakes={maxTakes}
            currentTakeNo={currentTakeNo}
            answers={result.answers}
            onChangeTake={setCurrentTakeNo}
          />
        </div>
        <div className="text-align-c">
          {showRetakes && (
          <div onClick={() => setCurrentTakeNo(completedTakes + 1)} className={styles.retakeBtn}>
            <RecordButton className={styles.recordBtnContainer} recordButtonClass={styles.recordBtn} />
            {I18n().t('assessments.video_response.retake')}
          </div>
          )}
        </div>
        <div className="text-align-r">
          {completedTakes > 1 && !currentTakeIsSelected
            && (
            <ColoredButton
              type="primary"
              className={styles.allowButton}
              color="green"
              onClick={() => handleUserSelectedTake(currentTakeDetails.media_id)}
            >
              <CheckOutlined />
              {I18n().t('assessments.video_response.use_this')}
            </ColoredButton>
            )}
          {completedTakes > 1 && currentTakeIsSelected
            && (
            <div className={styles.inUse}>
              <CheckOutlined />
              {' '}
              {I18n().t('assessments.video_response.selected')}
            </div>
            )}
        </div>
      </div>
      )}
    </div>
  )
}

export default withLimitedTakes
