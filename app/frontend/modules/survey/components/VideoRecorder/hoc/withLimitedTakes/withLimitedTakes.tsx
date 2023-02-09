import { useState, useEffect } from 'react'
import {
  Button, Row, Col, Tooltip,
} from 'antd'
import { SelectOutlined, CheckOutlined } from '@ant-design/icons'
import axios from 'axios'
import find from 'lodash/find'
import findIndex from 'lodash/findIndex'

import { InProgressQuestion, MediaResponse } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

import { I18n } from '~/modules/survey/store/StoreWatchman'
import useMap from '~/hooks/useMap'
import MultipleTakeButtons from './MultipleTakeButtons'

import styles from './styles.less'

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
  errors: object
}

export interface Answer {
  take_no: number
  user_selected: boolean
  media_id: number
}

interface Errors {
  userSelected: string
}

const withLimitedTakes = (WrappedComponent, { maxTakes }: { maxTakes: number }) => (props: Props) => {
  const {
    onSuccessUpload, model, markMediaResponseAsSelected, inProgressQuestions, mediaResponses,
  } = props
  const [currentTakeIndex, setCurrentTakeIndex] = useState(0)
  const [recordingAllowed, setRecordingAllowed] = useState(false)
  const [userSelectedLoading, setUserSelectedLoading] = useState(false)
  const [errors, errorUtils] = useMap<Errors>()

  const completedTakes = mediaResponses.length

  const currentMediaResponse = mediaResponses[currentTakeIndex]

  const showRetakes: boolean = completedTakes > 0 && completedTakes < maxTakes && !!currentMediaResponse

  const recordingInProgress = find(inProgressQuestions || [], ({ questionId }) => questionId === model.id)

  const currentTakeIsSelected = currentMediaResponse && currentMediaResponse.userSelected
  const selectedTakeIndex = findIndex(mediaResponses, ({ userSelected }) => userSelected)

  useEffect(() => {
    let currentTakeIndexToSet = findIndex(mediaResponses, ({ userSelected }) => userSelected)
    currentTakeIndexToSet = currentTakeIndexToSet > 0 ? currentTakeIndexToSet : 0
    setCurrentTakeIndex(currentTakeIndexToSet)
  }, [])

  const handleAllowRecording = () => {
    setRecordingAllowed(true)
  }

  const handleOnSuccessUpload = (data: MediaResponse) => {
    data.userSelected && markMediaResponseAsSelected(data)
    onSuccessUpload && onSuccessUpload(data)
  }

  const handleUserSelectedTake = async (mediaResponse: MediaResponse) => {
    const { mediaUrl } = props
    setUserSelectedLoading(true)
    try {
      await axios.put(
        `${mediaUrl}/mark_as_user_selected_take`,
        { take_no: currentTakeIndex, media_id: mediaResponse.id },
        {
          headers: {
            'X-CSRF-Token': (document.querySelector('meta[name="csrf-token"]') as Element).getAttribute('content'),
          },
        },
      )
      markMediaResponseAsSelected(mediaResponse)
      errorUtils.remove('userSelected')
    } catch (error) {
      errorUtils.set('userSelected', I18n().t('assessments.unknown_error'))
      throw error
    } finally {
      setUserSelectedLoading(false)
    }
  }

  const overlayControls = () => {
    if (recordingInProgress) return null
    return (
      <div className={styles.overlayControls}>
        <Row>
          <Col span="4" offset="20">
            <div className={styles.currentTakeNo}>{currentTakeIndex + 1}</div>
          </Col>
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
      errors={errors}
    />
  )

  if (maxTakes === 1) {
    return renderWrappedComponent()
  }

  return (
    <div>
      {renderWrappedComponent()}
      {!recordingInProgress && (
      <Row>
        <Col span={24} order={1} xs={{ span: 24, order: 1 }} sm={9} className="ta-xs-c ta-sm-s mtm">
          <MultipleTakeButtons
            maxTakes={maxTakes}
            currentTakeIndex={currentTakeIndex}
            selectedTakeIndex={selectedTakeIndex}
            mediaResponses={mediaResponses}
            onChangeTakeIndex={(index: number) => {
              errorUtils.reset()
              setCurrentTakeIndex(index)
            }}
          />
        </Col>
        <Col xs={{ span: 24, order: 3 }} sm={{ span: 6, order: 2 }} className="ta-xs-c mtm">
          {showRetakes && (
          <Button
            onClick={() => setCurrentTakeIndex(completedTakes)}
            className={styles.retakeBtn}
            type="default"
            size="middle"
            icon={<span className="fa fa-dot-circle-o" />}
          >
            {I18n().t('assessments.video_response.retake')}
          </Button>
          )}
        </Col>
        <Col xs={{ span: 24, order: 2 }} sm={{ span: 9, order: 3 }} className="ta-xs-c ta-sm-e mtm">
          {completedTakes > 0 && !currentTakeIsSelected && currentMediaResponse?.url && (
          <Button
            type="primary"
            onClick={() => handleUserSelectedTake(currentMediaResponse)}
            size="middle"
            loading={userSelectedLoading}
            icon={<SelectOutlined />}
          >
            {I18n().t('assessments.video_response.use_this')}
          </Button>
          )}
          {completedTakes > 0 && currentTakeIsSelected && currentMediaResponse?.url && (
            <Tooltip placement="topLeft" title={I18n().t('assessments.video_response.saved.tooltip')}>
              <Button
                type="default"
                size="middle"
                icon={<CheckOutlined />}
                disabled
              >
                {I18n().t('assessments.video_response.saved.label')}
              </Button>
            </Tooltip>
          )}
        </Col>
      </Row>
      )}
    </div>
  )
}

export default withLimitedTakes
