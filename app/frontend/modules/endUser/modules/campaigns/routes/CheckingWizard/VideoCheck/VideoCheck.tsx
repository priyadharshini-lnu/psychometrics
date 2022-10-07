import _ from 'lodash'
import React, { useReducer, useRef, useEffect } from 'react'
import {
  Button, Card, Col,
} from 'antd'
import { CheckOutlined, RightOutlined } from '@ant-design/icons'
import * as faceapi from 'face-api.js'

import { BROWSER_NAME } from 'utils/uaParser'
import { InitVideo } from './InitVideo'
import { Progress } from '../Progress'
import { CheckList } from '../CheckList'

import reducer, {
  initialState, updateAccess, updateFaceDetection, failFaceDetectionByTimeout,
} from './reducer'
import { CheckListStatus } from '../interfaces'

import styles from './styles.less'

const { I18n } = window

interface Props {
  nextStep: () => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let player: any = null

export const VideoCheck: React.FC<Props> = ({ nextStep }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!videoRef.current) return

    player = InitVideo.run(videoRef.current)
    player.on('error', () => {
      dispatch(updateAccess(CheckListStatus.Failed))
    })
    faceapi.nets.tinyFaceDetector.loadFromUri('/face-api/models')
    player.on('deviceReady', () => {
      player.record().start()
    })
    player.on('startRecord', () => {
      setTimeout(() => track(), 1000)
    })
    player.on('finishRecord', () => dispatch(failFaceDetectionByTimeout()))
  }, [])

  const requestAccess = async () => {
    if (!videoRef.current) return


    try {
      await navigator.mediaDevices.getUserMedia({ video: true })
      dispatch(updateAccess(CheckListStatus.Done))
      player.record().getDevice()
    } catch (e) {
      dispatch(updateAccess(CheckListStatus.Failed))
    }
  }

  const track = async () => {
    if (!videoRef.current) return

    const options = new faceapi.TinyFaceDetectorOptions()
    const detections = await faceapi.detectSingleFace(videoRef.current, options)
    if (detections) {
      dispatch(updateFaceDetection(CheckListStatus.Done))
      setTimeout(() => player.record().stop(), 500)
    } else {
      setTimeout(() => track(), 500)
    }
  }

  const rerun = async () => {
    await requestAccess()
    if (state.access === CheckListStatus.Failed) return

    dispatch(updateFaceDetection(CheckListStatus.InProgress))
    player.record().start()
  }

  return (
    <>
      <Col className={styles.container} lg={16} xs={24} sm={24}>
        <Card className={styles.card}>
          <h4>{I18n.t('checking_wizard.video_check.title')}</h4>
          <p>{I18n.t('checking_wizard.video_check.description')}</p>
          <div className="position-relative">
            <video ref={videoRef} className={styles.video} />
            {_.includes([CheckListStatus.InProgress, CheckListStatus.Failed], state.access) && (
            <div className={styles.videoOverlap}>
              <div className={styles.iconContainer}>
                <span className={styles.icon} />
              </div>
              <div className={styles.allowTitle}>
                {I18n.t('checking_wizard.video_check.allow_title')}
              </div>
              {state.access === CheckListStatus.InProgress && (
              <Button type="primary" onClick={requestAccess}>
                <CheckOutlined />
                {I18n.t('checking_wizard.video_check.allow')}
              </Button>
              )}
              {state.access === CheckListStatus.Failed && (
              <Button type="primary" size="middle">
                <a
                  href={`https://www.google.com/search?q=allow+camera+and+microphone+access+on+${BROWSER_NAME}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {I18n.t('checking_wizard.video_check.access_help')}
                </a>
              </Button>
              )}
            </div>
            )}
          </div>
        </Card>
      </Col>
      <Col className={styles.container} lg={8} xs={24} sm={24}>
        <Card className={styles.card}>
          <Progress percent={30} title={I18n.t('checking_wizard.video_check.processing')} />
          <CheckList
            className="mt24"
            dataSource={[
              { name: I18n.t('checking_wizard.video_check.access'), status: state.access },
              { name: I18n.t('checking_wizard.video_check.face_detection'), status: state.faceDetection },
            ]}
          />
          {state.access !== CheckListStatus.Failed && state.faceDetection !== CheckListStatus.Failed ? (
            <Button
              size="middle"
              type="primary"
              className={styles.continueButton}
              onClick={nextStep}
              disabled={state.access !== CheckListStatus.Done || state.faceDetection !== CheckListStatus.Done}
            >
              {I18n.t('checking_wizard.video_check.continue')}
              <RightOutlined />
            </Button>
          )
            : (
              <Button
                type="primary"
                className={styles.continueButton}
                onClick={rerun}
              >
                {I18n.t('checking_wizard.video_check.run_again')}
                <RightOutlined />
              </Button>
            )
          }
        </Card>
      </Col>
    </>
  )
}

export default VideoCheck
