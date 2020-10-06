import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import axios from 'axios'
import { InProgressQuestion, MediaResponse } from 'modules/survey/core/preview/FlowProcessor/interfaces'
import { SelectOutlined } from '@ant-design/icons'
import {
  Button, Row, Col, Space,
} from 'antd'
import cs from 'classnames'
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

  const currentTakeIsSelected = currentMediaResponse && currentMediaResponse.userSelected
  const selectedTakeIndex = _.findIndex(mediaResponses, ({ userSelected }) => userSelected)

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

  const overlayControls = () => {
    if (recordingInProgress) return null
    return (
      <div className={styles.overlayControls}>
        <Row>
          <Col span="16" offset="4">
            <Space>
              {showRetakes && (
              <Button
                onClick={() => setCurrentTakeIndex(completedTakes)}
                className={styles.retakeBtn}
                type="default"
                size="large"
                icon={<span className="fa fa-dot-circle-o" />}
              >
                {I18n().t('assessments.video_response.retake')}
              </Button>
              )}
              {completedTakes > 1 && !currentTakeIsSelected && currentMediaResponse && (
              <Button
                type="default"
                className={styles.allowButton}
                onClick={() => handleUserSelectedTake(currentMediaResponse)}
                size="large"
              >
                <SelectOutlined />
                {I18n().t('assessments.video_response.use_this')}
              </Button>
              )}
            </Space>
          </Col>
          <Col span="4"><div className={styles.currentTakeNo}>{currentTakeIndex + 1}</div></Col>
        </Row>
      </div>
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
      extraControls={overlayControls()}
    />
  )

  if (maxTakes === 1) {
    return renderWrappedComponent()
  }

  return (
    <div>
      {renderWrappedComponent()}
      {!recordingInProgress && (
        <div className={cs(styles.takesContainer, 'mtm', 'text-align-c')}>
          <MultipleTakeButtons
            maxTakes={maxTakes}
            currentTakeIndex={currentTakeIndex}
            selectedTakeIndex={selectedTakeIndex}
            mediaResponses={mediaResponses}
            onChangeTakeIndex={setCurrentTakeIndex}
          />
        </div>
      )}
    </div>
  )
}

export default withLimitedTakes
