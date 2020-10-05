import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import axios from 'axios'
import { CheckOutlined } from '@ant-design/icons'
import ColoredButton from 'components/ColoredButton'
import RecordButton from 'modules/survey/components/AudioRecorder/MediaButtons/RecordButton'
import { InProgressQuestion, MediaResponse } from 'modules/survey/core/preview/FlowProcessor/interfaces'
import { I18n } from 'modules/survey/store/StoreWatchman'
import MultipleTakeButtons from './MultipleTakeButtons'
import styles from './styles.scss'

interface Props {
  onSuccessUpload(mediaResponse: MediaResponse): void
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
  mediaResponses: MediaResponse[]
  markMediaResponseAsSelected(mediaResponse: MediaResponse): void
}

export interface Answer {
  take_no: number
  user_selected: boolean
  media_id: number
}

const withLimitedTakes = (WrappedComponent, { maxTakes }: { maxTakes: number }) => (props: Props) => {
  const {
    onSuccessUpload, model, markMediaResponseAsSelected, inProgressQuestions, mediaResponses,
  } = props
  const [currentTakeIndex, setCurrentTakeIndex] = useState(0)
  const [recordingAllowed, setRecordingAllowed] = useState(false)

  const completedTakes = mediaResponses.length

  const currentMediaResponse = mediaResponses[currentTakeIndex]

  const showRetakes: boolean = completedTakes > 0 && completedTakes < maxTakes && !!currentMediaResponse

  const recordingInProgress = _.find(inProgressQuestions || [], ({ questionId }) => questionId === model.id)

  useEffect(() => {
    let currentTakeIndexToSet = _.findIndex(mediaResponses, ({ userSelected }) => userSelected)
    currentTakeIndexToSet = currentTakeIndexToSet > 0 ? currentTakeIndexToSet : 0
    setCurrentTakeIndex(currentTakeIndexToSet)
  }, [])

  const handleAllowRecording = () => {
    setRecordingAllowed(true)
  }

  const handleOnSuccessUpload = (data: MediaResponse) => {
    onSuccessUpload && onSuccessUpload(data)
  }

  const handleUserSelectedTake = (mediaResponse: MediaResponse) => {
    const { mediaUrl } = props
    markMediaResponseAsSelected(mediaResponse)
    axios.put(
      `${mediaUrl}/mark_as_user_selected_take`,
      { take_no: currentTakeIndex, media_id: mediaResponse.id },
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
      mediaResponse={currentMediaResponse}
      key={currentTakeIndex}
      onSuccessUpload={handleOnSuccessUpload}
      disallowDiscard
      recordingAllowed={recordingAllowed}
      onRecordingAllowed={handleAllowRecording}
    />
  )

  if (maxTakes === 1) {
    return renderWrappedComponent()
  }

  const currentTakeIsSelected = currentMediaResponse && currentMediaResponse.userSelected

  return (
    <div>
      {renderWrappedComponent()}
      {!recordingInProgress && (
      <div className={styles.retakeContainer}>
        <div>
          <MultipleTakeButtons
            maxTakes={maxTakes}
            currentTakeIndex={currentTakeIndex}
            mediaResponses={mediaResponses}
            onChangeTakeIndex={setCurrentTakeIndex}
          />
        </div>
        <div className="text-align-c">
          {showRetakes && (
          <div onClick={() => setCurrentTakeIndex(completedTakes)} className={styles.retakeBtn}>
            <RecordButton className={styles.recordBtnContainer} recordButtonClass={styles.recordBtn} />
            {I18n().t('assessments.video_response.retake')}
          </div>
          )}
        </div>
        <div className="userSelectedContainer">
          {completedTakes > 1 && !currentTakeIsSelected && currentMediaResponse
            && (
            <ColoredButton
              type="primary"
              className={styles.allowButton}
              color="green"
              onClick={() => handleUserSelectedTake(currentMediaResponse)}
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
